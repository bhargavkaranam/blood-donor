import React from 'react';
import {render} from 'react-dom';
require('./css/style.css');
import { Modal, Button, FormGroup,ControlLabel,FormControl } from 'react-bootstrap';
import validator from 'validator';

class DemoForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			firstName: '',
			lastName: '',
			mobile: '',
			email: '',
			blood: '',
			message: '',
			clickedX: this.props.clickedX,
			clickedY: this.props.clickedY
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.sendToServer = this.sendToServer.bind(this);
		this.socket = this.props.socket;

	}

	handleChange(e) {
		
		const target = e.currentTarget;

		this.setState({
			[target.name]: target.value
		});
		
	}

	handleSubmit() {
		
		// try {
		// 	this.state.mobile = this.state.mobile.replace('+','00');
		// }catch(err) {

		// }
		if(this.state.email === '' || this.state.firstName === '' || this.state.lastName === '' || this.state.mobile === '' || this.state.blood === '')
			this.setState({message: 'All fields are required.'});
		else if(!validator.isEmail(this.state.email))
			this.setState({message: 'Email is not valid.'});
		else if(!validator.isAlpha(this.state.firstName) || !validator.isAlpha(this.state.lastName))
			this.setState({message: 'Name can contain only characters.'});
		else if(!/^(\+\d{2}|00\d{2}) (\d{3} \d{4} \d{3})$/.test(this.state.mobile))
			this.setState({message: 'Phone number is not valid.'});
		else {
			$(".donorFormButton").hide();
			setTimeout(function(){ $(".donorFormButton").show(); }, 8080);
			this.sendToServer();
		}
	}

	sendToServer() {
		

		$.ajax({
			url: '/donor/save',
			type: 'post',
			data: this.state,
			dataType: 'json',
			success: function(data) {
				(data.status == true) ? this.setState({message: 'Details added successfully. Your URL is https://patient-donor.appspot.com/edit/' + data.uid}) : this.setState({message: 'Error occurred. Try again.'});
			}.bind(this)
		})
		// this.socket.emit('newDonor',this.state);
		


	}

	render() {
		return(
			<form>
			<FormGroup
			controlId="formBasicText"
			
			>
			<ControlLabel>First Name</ControlLabel>
			<FormControl name="firstName"
			type="text"
			value={this.state.firstName}
			onChange={this.handleChange}
			placeholder="Enter text"
			
			/>

			
			</FormGroup>
			<FormGroup
			controlId="formBasicText"
			
			>
			<ControlLabel>Last Name</ControlLabel>
			<FormControl name="lastName"
			type="text"
			value={this.state.lastName}
			onChange={this.handleChange}
			placeholder="Enter text"
			
			/>
			
			
			</FormGroup>

			<FormGroup
			controlId="formBasicText"
			
			>
			<ControlLabel>Contact Number</ControlLabel>
			<FormControl name="mobile"
			type="text"
			value={this.state.mobile}
			onChange={this.handleChange}
			placeholder="Enter mobile (00XX XXX XXXX XXX or +XX XXX XXXX XXX)"
			
			/>
			
			
			</FormGroup>

			<FormGroup
			controlId="formBasicText"
			
			>
			<ControlLabel>Email Address</ControlLabel>
			<FormControl name="email"
			type="text"
			value={this.state.email}
			onChange={this.handleChange}
			placeholder="Enter text"
			
			/>
			
			
			</FormGroup>
			<FormGroup controlId="formControlsSelect">
			<ControlLabel>Blood Group</ControlLabel>
			<FormControl name="blood" componentClass="select" placeholder="select" onChange={this.handleChange} value={this.state.blood}>
			<option>Select Blood Group</option>
            <option value="A+">A+</option>
			<option value="A-">A-</option>
			<option value="B+">B+</option>
			<option value="B-">B-</option>
			<option value="O+">O+</option>
			<option value="O-">O-</option>
			<option value="AB-">AB-</option>
			<option value="AB+">AB+</option>

			</FormControl>
			</FormGroup>
			
			<FormGroup
			controlId="formBasicText"
			
			>
			<Button className="donorFormButton" bsStyle="success" onClick={this.handleSubmit}>Submit</Button>
			<p className="message">{this.state.message}</p>
			</FormGroup>
			</form>
			)
	}
}

export default DemoForm;