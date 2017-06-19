'use strict';
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var path = require('path');
var config = require(path.resolve('./config/init'))();
var helper = require(path.resolve('./app/helper/helper.js'));
var firebase = require('firebase');
var helmet = require('helmet');

module.exports = function () {


    var app = express();
    app.locals.config = config;


    app.use(helmet());

    // parse application/json 
    app.use(bodyParser.json());


    // Setting the app router and static folder
    app.use(express.static(path.resolve(app.locals.config['staticPath'])));

    //setting templating engine
    app.set('views', 'app/views/');
    app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs', layoutsDir: 'app/views/layouts/', helpers: helper }));
    app.set('view engine', 'hbs');


    // Instantiate Firebase 
    require('../app/controller/globalObjects/firebaseRef')(app);

    // Instantiate Mail path 
    require('../app/controller/globalObjects/mailRef')(app);

    // Instantiating progresshive routes and REST
    require('../app/routes/webapp.server.route')(app);

    app.use(function (req, res, next) {
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            // res.sendFile(path.join(__dirname+'/app/views/404.html'));
            res.render('404', {
                layout: false, env: process.env.NODE_ENV,
                css: {
                    development: 'assets/css/prohivecss',
                    testing: 'assets/css/prohivecss',
                    staging: 'css',
                    production: 'css'
                }
            });
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    });

    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });

    return app;
}