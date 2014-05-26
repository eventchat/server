var express = require('express');

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

app.post('/echo', function (req, res) {
  res.send(req.body);
});

module.exports = app;

