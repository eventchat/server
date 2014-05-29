var http = require('http');
var mongoose = require('mongoose');
var app = require('./app');
var config = require('./config');

mongoose.connect(config.DB_URL);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
