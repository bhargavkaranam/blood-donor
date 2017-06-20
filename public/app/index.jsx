import React from 'react';
import {render} from 'react-dom';
require('./css/style.css');
import { Map, Layers, Graphic, Symbols, Geometry } from 'react-arcgis';

class App extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			longitude: '',
			latitude: '',
			loading: true,
			points: [
				{
					latitude: 17.6,
					longitude: 78.67
				}
			]
			
		};
		
		
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
		alert(e.x);
	}
	render () {
		if(this.state.loading) return(<p>Loading</p>);
		else {
		console.log(this.state);
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
			<Map onClick={this.handleClick} viewProperties={{
				center: [this.state.longitude, this.state.latitude],
				zoom: 6000
			}}>
			<Layers.GraphicsLayer>
            	{titanic}
        	</Layers.GraphicsLayer>
			</Map>
			</div>
			)
		}
	}
	}

	render(<App/>,document.getElementById("app"));