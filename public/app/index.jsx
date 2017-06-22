import React from 'react';
import {render} from 'react-dom';
require('./css/style.css');

import { esriPromise } from 'esri-promise';

import { Map, Layers, Graphic, Symbols, Geometry, Widgets } from 'react-arcgis';

import {Modal, Button, Col, Row} from 'react-bootstrap';

import DonorForm from './DonorForm.jsx'

import {Router,Link,browserHistory} from 'react-router-dom';

const Search = Widgets.Search;


var FontAwesome = require('react-fontawesome');

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
			donor: '',
			myMap: '',
			myView: '',
			showEmail: 'Show',
			showMobile: 'Show'
			
		};
		
		this.handleClick = this.handleClick.bind(this);
		this.close = this.close.bind(this);
		
		this.handleMapLoad = this.handleMapLoad.bind(this);
		this.socket = io();
		this.showDetails = this.showDetails.bind(this);
		this.donorModalClose = this.donorModalClose.bind(this);
		this.showEmail = this.showEmail.bind(this);
		this.showMobile = this.showMobile.bind(this);
	}

	componentWillMount() {
		
		this.socket.on('message',function(msg){
			console.log(msg);
		})

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(this.showPosition.bind(this));
		}
	}

	componentDidMount() {
		this.socket.on('results',function(results){
			
			this.setState({points: results});
		}.bind(this));

		this.socket.on('newDonor',function(newDonor){

			this.setState({points: this.state.points.concat(newDonor)});
		}.bind(this))
	}

	showPosition(position) {
		this.setState({
			longitude: position.coords.longitude,
			latitude: position.coords.latitude,
			loading: false

		})
		

	}
	handleClick(e) {
		
	console.log(e);
	
		var screenPoint = {
			x: e.x,
			y: e.y
		};
		this.state.myView.hitTest(screenPoint)
		.then(function(response){
       // do something with the result graphic
       		if(response.results.length > 0) {
		       	var graphic = response.results[0].graphic;
		       	console.log(graphic);
		       	this.showDetails(graphic.attributes);
		       	
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
   		}.bind(this))
	
	 
		

	

	}


	showDetails(donor) {
		console.log(donor);
		this.setState({showDonorModal: true,donor: donor});
		
		// console.log(donor);
	}
	
	handleMapLoad(map,view) {
		this.setState({
			myMap: map,
			myView: view
		});
		
	}

	donorModalClose() {
		this.setState({showDonorModal: false});
	}

	close() {
		this.setState({showModal: false});
	}

	showEmail() {
		$(".showMore").css('color','#212121');
		this.setState({showEmail: this.state.donor.email});
	}

	showMobile() {
		$(".showMore").css('color','#212121');
		this.setState({showMobile: this.state.donor.mobile});
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
						color: [140, 130, 130],
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
				<Row><Col xs={3}><FontAwesome name="user" size="2x" /></Col><Col xs={9}>{this.state.donor.firstName} &nbsp;{this.state.lastName}</Col></Row>
				<Row><Col xs={3}><FontAwesome name="envelope" size="2x" /></Col><Col xs={9}><span className="showMore" onClick={this.showEmail}>{this.state.showEmail}</span></Col></Row>
				<Row><Col xs={3}><FontAwesome name="medkit" size="2x" /></Col><Col xs={9}>{this.state.donor.bloodGroup}</Col></Row>
 				<Row><Col xs={3}><FontAwesome name="phone" size="2x" /></Col><Col xs={9}><span className="showMore" onClick={this.showMobile}>{this.state.showMobile}</span></Col></Row>

				
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

					const t = (<Graphic graphicProperties={{attributes: donor}}>
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
					<Layers.GraphicsLayer key={key} >	
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