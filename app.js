'use strict';

// Init the express application
// require('@google-cloud/debug-agent').start({ allowExpressions: true });

var app = require('./config/express')();

if (module === require.main) {
  // [START server]
  // Start the server

  var server = app.listen( app.locals.config['PORT'], function () {
    //  var server = app.listen( 8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
  });
  // [END server]
}

module.exports = app;
 