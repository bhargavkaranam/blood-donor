import React from 'react';
import {render} from 'react-dom';
require('./css/style.css');

import { esriPromise } from 'esri-promise';

import { Map, Layers, Graphic, Symbols, Geometry, Widgets } from 'react-arcgis';

import {Modal, Button} from 'react-bootstrap';

import DonorForm from './DonorForm.jsx'


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
			showModal: false
			
		};
		
		this.handleClick = this.handleClick.bind(this);
		this.close = this.close.bind(this);
	}

	componentWillMount() {
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
		

		esriPromise([
		    'esri/geometry/support/webMercatorUtils',
		    
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
            <DonorForm clickedX={this.state.clickedX} clickedY={this.state.clickedY}/>
          </Modal.Body>
          
        </Modal>
			<Map onClick={this.handleClick} viewProperties={{
				center: [this.state.longitude, this.state.latitude],
				zoom: 6000
			}}>
			<Layers.GraphicsLayer>
            	{titanic}
        	</Layers.GraphicsLayer>
        	<Search position="top-right" />
			</Map>
			</div>
			)
		}
	}
	}

	render(<App/>,document.getElementById("app"));