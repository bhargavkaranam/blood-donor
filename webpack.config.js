var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public');
var APP_DIR = path.resolve(__dirname, 'public/app');

var config = {
	entry: APP_DIR + '/main.jsx',
	output: {
		path: BUILD_DIR,
		filename: 'bundle.js'
	},
	module : {
		loaders : [
		{
			test : /\.jsx?/,
			include : APP_DIR,
			loader : 'babel-loader'
		},
		{ 
			test: /\.css$/, 
			include: APP_DIR,
			loader: "style-loader!css-loader" 
		},
		]
		
	}




};

module.exports = config;
