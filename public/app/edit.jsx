import React from 'react';
import {render} from 'react-dom';
require('./css/style.css');
import { Modal, Button, FormGroup,ControlLabel,FormControl, Row, Col } from 'react-bootstrap';
import validator from 'validator';


class Edit extends React.Component {
	constructor(props) {
		super(props);
		console.log(props);
		this.state = {
			id: '',
			firstName: '',
			lastName: '',
			mobile: '',
			email: '',
			blood: '',
			message: '',
			clickedX: this.props.clickedX,
			clickedY: this.props.clickedY,
			showForm: 'block'
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.sendToServer = this.sendToServer.bind(this);
		this.socket = io();
	}
	componentWillMount() {
		$.ajax({
			url: '/donor/get',
			type: 'post',
			data: 'uid=' + this.props.match.params.uid,
			dataType: 'json',
			success: function(data) {
				if(data.status) {
					this.setState({
						id: data.results.id,
						firstName: data.results.firstName,
						lastName: data.results.lastName,
						blood: data.results.bloodGroup,
						email: data.results.email,
						mobile: data.results.mobile
					})
				}
				else {
					this.setState({showForm: 'none'});
				}
			}.bind(this)
		})
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
		// else if(/^\+[1-9]{1}[0-9]{3,14}$/.test(this.state.mobile))
		// 	this.setState({message: 'Phone number is not valid.'});
		else {
			this.sendToServer();
		}
	}

	sendToServer() {
		
		this.socket.emit('newDonor',this.state);
		this.socket.on('result',function(msg){
			
			(msg.status == true) ? this.setState({message: 'Details added successfully. Your URL is http://localhost:3000/edit/' + msg.uid}) : this.setState({message: 'Error occurred. Try again.'});
			// this.props.close();

		}.bind(this));


	}
	render() {
		if(this.state.showForm == 'block') {
		return(

			<Row style={{'marginTop':150}}>

			<Col xs={4} xsOffset={4} style={{'display': this.state.showForm}}>
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
			placeholder="Enter text"
			
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
			<p>{this.state.message}</p>
			</FormGroup>
			</form>
			</Col>
			</Row>
			)
		}
		else {
			return(<h1>No such donor exisits</h1>);
		}
	}
}

export default Edit;