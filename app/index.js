var express  = require('express');
var mongoose = require('mongoose');
var echo     = require('./controllers/echo');
var users    = require('./controllers/users');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);

if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/echo', echo.show);
app.get('/users/:id', users.show);

module.exports = app;

