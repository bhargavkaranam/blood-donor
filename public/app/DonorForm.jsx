import React from 'react';
import {render} from 'react-dom';
require('./css/style.css');
import { Modal, Button, FormGroup,ControlLabel,FormControl } from 'react-bootstrap';

class DemoForm extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return(
			<form>
			<FormGroup
			controlId="formBasicText"
			
			>
			<ControlLabel>First Name</ControlLabel>
			<FormControl
			type="text"
			
			placeholder="Enter text"
			
			/>

			
			</FormGroup>
			<FormGroup
			controlId="formBasicText"
			
			>
			<ControlLabel>Last Name</ControlLabel>
			<FormControl
			type="text"
			
			placeholder="Enter text"
			
			/>
			
			
			</FormGroup>

			<FormGroup
			controlId="formBasicText"
			
			>
			<ControlLabel>Contact Number</ControlLabel>
			<FormControl
			type="number"
			
			placeholder="Enter text"
			
			/>
			
			
			</FormGroup>

			<FormGroup
			controlId="formBasicText"
			
			>
			<ControlLabel>Email Address</ControlLabel>
			<FormControl
			type="text"
			
			placeholder="Enter text"
			
			/>
			
			
			</FormGroup>

			<FormGroup
			controlId="formBasicText"
			
			>
			<ControlLabel>Blood Group</ControlLabel>
			<FormControl
			type="text"
			
			placeholder="Enter text"
			
			/>
			
			
			</FormGroup>
			<FormGroup
			controlId="formBasicText"
			
			>
			<Button className="donorFormButton" bsStyle="success" onClick={this.close}>Close</Button>
			</FormGroup>
			</form>
		)
	}
}

export default DemoForm;