import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Map } from 'react-arcgis';


class Maps extends React.Component {
	constructor() {
		super(props);

	}

	render() {
		return(
			<div className="map">
			<Map />
			</div>
			)
	}
}

export default Maps;