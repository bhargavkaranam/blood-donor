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

var GeoPoint = require('geopoint');

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
			showMobile: 'Show',
			dragPrevious: null,
			dragging: false,
			viewProperties: {
				center: [-122.4443, 47.2529],
				scale: 50000
			},

			
		};
		
		this.handleClick = this.handleClick.bind(this);
		this.close = this.close.bind(this);
		
		this.handleMapLoad = this.handleMapLoad.bind(this);
		this.socket = io();
		this.showDetails = this.showDetails.bind(this);
		this.donorModalClose = this.donorModalClose.bind(this);
		this.showEmail = this.showEmail.bind(this);
		this.showMobile = this.showMobile.bind(this);
		this.handleDrag = this.handleDrag.bind(this);
		// this.handleMouseWheel = this.handleMouseWheel.bind(this);
		this.lazyLoad = this.lazyLoad.bind(this);
	}

	componentWillMount() {
		

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(this.showPosition.bind(this));
		}
		
		this.socket.on('message',function(msg){
			console.log(msg);
		})

		
		

	}

	componentDidMount() {
		
		
		this.socket.on('results',function(results){
			results.map((result) => {
				result.visible = false;
			})			
			this.setState({points: results}, () => {
				this.lazyLoad();
			});

		}.bind(this));

		this.socket.on('newDonor',function(newDonor){

			this.setState({points: this.state.points.concat(newDonor)}, () => {
				this.lazyLoad();
			});
		}.bind(this))
	}

	showPosition(position) {
		this.setState({
			longitude: position.coords.longitude,
			latitude: position.coords.latitude,
			loading: false,
			viewProperties: {
				center: [position.coords.longitude,position.coords.latitude],
				scale: 50000
				
			}

		}, () => {
			this.lazyLoad();
		})
		

	}
	handleClick(e) {
		
		

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
		this.setState({showDonorModal: false,showEmail: 'Show',
			showMobile: 'Show'});
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



	handleDrag(e) {
		e.stopPropagation();
		if (e.action === "start") {
			this.setState({
				dragPrevious: {
					x: e.x,
					y: e.y
				},
				dragging: true
			});

		} else if (e.action === "end") {
			this.setState({
				dragPrevious: null,
				dragging: false
			});

		} else if (e.action === "update" && this.state.dragging) {
			this.setState({
				dragPrevious: {
					x: e.x,
					y: e.y
				},
				viewProperties: {
					...this.state.viewProperties,
					center: [
					this.state.viewProperties.center[0] - 0.0001 * (e.x - this.state.dragPrevious.x) * (this.state.viewProperties.scale / 25000),
					this.state.viewProperties.center[1] + 0.0001 * (e.y - this.state.dragPrevious.y) * (this.state.viewProperties.scale / 25000)
					]
				}
			});
			this.lazyLoad();
		}
		
	}


	lazyLoad() {
		
		var newCenter = new GeoPoint(this.state.viewProperties.center[1], this.state.viewProperties.center[0]);
		this.state.points.map((point,index) => {
			var checkPoint = new GeoPoint(point.long,point.lat);
			var distance = newCenter.distanceTo(checkPoint,true);
			var stateCopy = Object.assign({}, this.state);
			stateCopy.points = stateCopy.points.slice();
			stateCopy.points[index] = Object.assign({}, stateCopy.points[index]);
			
			if(distance <= 5)
				stateCopy.points[index].visible = true;
			
			else
				stateCopy.points[index].visible = false;

			this.setState(stateCopy);

		})
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
				<Map onMouseWheel={(e) => this.handleMouseWheel} onDrag={this.handleDrag} onLoad={this.handleMapLoad} onClick={this.handleClick} viewProperties={this.state.viewProperties}
				>
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
						if(donor.visible) {
						return(
							<Layers.GraphicsLayer key={key} >	
							{t}
							</Layers.GraphicsLayer>
							);
					
					 	}
					 	else {
					 		return(<div key={key}></div>);
					 	}
					

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