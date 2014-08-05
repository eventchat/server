var express       = require('express');
var mongoose      = require('mongoose');
var config        = require('../config');
var echo          = require('./controllers/echo');
var users         = require('./controllers/users');
var events        = require('./controllers/events');
var posts         = require('./controllers/posts');
var friendships   = require('./controllers/friendships');
var chat          = require('./controllers/chat');
var notifications = require('./controllers/notifications');
var session       = require('./controllers/session');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);

if ('development' === app.get('env')) {
  app.use(express.logger('dev'));
}

app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser(config.SECRET));
app.use(express.cookieSession());
app.use(app.router);

if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
  res.redirect('http://eventchat.github.io/homepage/');
});
app.post('/echo', echo.show);
app.get('/users/:user_id/friends', friendships.index);
app.post('/users/:user_id/friends', friendships.create);
app.get('/users/:user_id/events', events.indexByUser);
app.get('/users/:id', users.show);
app.post('/users', users.create);
app.get('/events/search', events.search);
app.get('/events/:id/attendees', events.indexAttendees);
app.post('/events/:id/attendees', events.joinEvent);
app.get('/events/:id', events.show);
app.post('/events', events.create);
app.post('/posts/:id/liked_by', posts.like);
app.delete('/posts/:id/liked_by', posts.unlike);
app.get('/posts/search', posts.search);
app.get('/posts/:id', posts.show);
app.post('/posts', posts.create);
app.delete('/posts/:id', posts.delete);
app.post('/posts/:post_id/comments', posts.createComment);
app.get('/users/:id/posts', posts.indexByUser);
app.post('/session', session.create);
app.get('/session', session.show);
app.delete('/session', session.delete);
app.get('/chat', chat.show);
app.post('/chat', chat.create);
app.get('/notifications', notifications.index);

module.exports = app;

