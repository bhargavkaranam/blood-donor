import React from 'react';
import {render} from 'react-dom';
require('./css/style.css');

import { esriPromise } from 'esri-promise';

import { Map, Layers, Graphic, Symbols, Geometry, Widgets } from 'react-arcgis';

import {Modal, Button} from 'react-bootstrap';

import DonorForm from './DonorForm.jsx'

import {Router,Link,browserHistory} from 'react-router-dom';

const Search = Widgets.Search;

class App extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			longitude: '',
			latitude: '',
			loading: true,
			clickedX: '',
			clickedY: '',
			showModal: false,
			showDonorModal: false,
			points: [],
			donor: {},
			myMap: '',
			myView: ''
			
		};
		
		this.handleClick = this.handleClick.bind(this);
		this.close = this.close.bind(this);
		
		this.handleMapLoad = this.handleMapLoad.bind(this);
		this.socket = io();
		this.showDetails = this.showDetails.bind(this);
	}

	componentWillMount() {
		this.socket.on('results',function(results){
			
			this.setState({points: results});
		}.bind(this));
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(this.showPosition.bind(this));
		}
	}

	showPosition(position) {
		this.setState({
			longitude: position.coords.longitude,
			latitude: position.coords.latitude,
			loading: false

		})
		

	}
	handleClick(e) {
		
	if(e.graphic) {
		var screenPoint = {
			x: e.x,
			y: e.y
		};
		this.state.myMap.hitTest(screenPoint)
		.then(function(response){
       // do something with the result graphic
       	var graphic = response.results[0].graphic;
       	this.showDetails();
       	console.log("here");
       	
   		})
	}
	else {
		esriPromise([
			'esri/geometry/support/webMercatorUtils'
			

		]).then(([webMercatorUtils]) => { // Modules come back as an array, so array destructuring is convenient here. 
		    // Make a map with the Map and MapView modules from the API. 
		    
		    var mp = webMercatorUtils.xyToLngLat(e.mapPoint.x,e.mapPoint.y);
		    this.setState({
		    	clickedX: mp[0],
		    	clickedY: mp[1],
		    	showModal: true

		    })
		})
		.catch((err) => {
			console.log(err);
		});

	}

	}


	showDetails(e) {
		
		// this.setState({showDonorModal: true});
		console.log("Called");
		// console.log(donor);
	}
	
	handleMapLoad(map,view) {
		this.setState({
			myMap: map,
			myView: view
		});
	}

	close() {
		this.setState({showModal: false});
	}
	render () {
		if(this.state.loading) return(<p>Loading</p>);
			else {

				const titanic = (
				<Graphic>
				<Symbols.SimpleMarkerSymbol
				symbolProperties={{
					color: [226, 119, 40],
					outline: {
						color: [255, 255, 255],
						width: 3
					}
				}}
				/>
				<Geometry.Point
				geometryProperties={{
					latitude: this.state.latitude,
					longitude: this.state.longitude
				}}
				/>
				</Graphic>
				);
				return(


				<div className="map">
				<Modal show={this.state.showModal} onHide={this.close}>
				<Modal.Header closeButton>
				<Modal.Title>Register</Modal.Title>
				</Modal.Header>
				<Modal.Body>
				<DonorForm close={this.close} socket={this.socket} clickedX={this.state.clickedX} clickedY={this.state.clickedY}/>
				</Modal.Body>

				</Modal>
				<Modal show={this.state.showDonorModal} onHide={this.donorModalClose}>
				<Modal.Header closeButton>
				<Modal.Title>Donor</Modal.Title>
				</Modal.Header>
				<Modal.Body>
				<p>{this.state.donor.firstName}</p>
				<p>{this.state.donor.email}</p>
				</Modal.Body>

				</Modal>
				<Map onLoad={this.handleMapLoad} onClick={this.handleClick} viewProperties={{
					center: [this.state.longitude, this.state.latitude],
					zoom: 600
				}}>
				<Layers.GraphicsLayer>
				{titanic}
				</Layers.GraphicsLayer>
				{this.state.points.map((donor,key) => {

					const t = (<Graphic>
					<Symbols.SimpleMarkerSymbol
					symbolProperties={{
						color: [226, 119, 40],
						outline: {
							color: [255, 255, 255],
							width: 3
						}
					}}
					/>
					<Geometry.Point
					geometryProperties={{
						latitude: donor.long,
						longitude: donor.lat
					}}
					/>
					</Graphic>);
					return(
					<Layers.GraphicsLayer key={key}>	
					{t}
					</Layers.GraphicsLayer>
					);

				})}

				<Search position="top-right" />
				</Map>
				</div>
				)
			}
		}
	}

export default App;
	// render(<App/>,document.getElementById("app"));