import React from 'react'
import {render} from 'react-dom';
import {
	BrowserRouter as Router,
	Route,
	browserHistory,
	Link
} from 'react-router-dom'

import Edit from './edit.jsx';
import Home from './index.jsx'




render(<Router history={browserHistory}>
	<div>
	<Route exact path="/" component={Home} />

	<Route path="/edit/:uid" component={Edit}/>
	</div>

	</Router>,document.getElementById('app'));