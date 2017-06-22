var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');


var socket_io    = require( "socket.io" );


var app = express();


var io = socket_io();
app.io = io;


// var donor = require('./controller/save-donors.js')(io);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var d = require('./routes/donor');

d.emitAllRecords(io);

app.use('/donor/save',d.save(io));
app.use('/donor/get',d.getDetails);
app.use('/donor/update',d.update(io));
app.use('/donor/delete',d.delete(io));
app.use('/delete',d.deleteAll);
app.use('*',index);

// app.use('/save',donor)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.end('Error');
});

module.exports = app;
