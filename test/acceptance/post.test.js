/* globals describe, it, before, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var User     = require('../../app/models/user');
var Event    = require('../../app/models/event');
var Post     = require('../../app/models/post');
var Comment  = require('../../app/models/comment');
var config   = require('../../config');


describe('Post API', function () {

  var user;
  var event;
  var comment;
  var post;

  before(function () {
    mongoose.connect(config.db.test.path);
  });

  beforeEach(function (done) {
    // clear the database, then populate sample data
    User.remove(function () {
      Post.remove(function () {
        Comment.remove(function () {
          Event.remove(function () {
            user = new User({
              name: 'Joe',
              email: 'joe@example.com',
              info: 'This guy is lazy',
              password: '123456'
            });
            user.save(function () {
              event = new Event({
                name: 'PyCon',
                description: 'Python Conference',
                location: [37.3894, -122.0819]
              });
              event.save(function () {
                comment = new Comment({
                  author: user._id,
                  body: 'Awesome'
                });
                comment.save(function () {
                  post = new Post({
                    type: 'text',
                    title: 'What\'s MetaClass',
                    body: 'Just dark magic',
                    event: event._id,
                    author: user._id,
                    comments: [comment._id]
                  });
                  post.save(done);
                });
              });
            });
          });
        });
      });
    });

  });

  after(function () {
    mongoose.disconnect();
  });

  describe('GET /posts/:post_id', function () {
    it('it should respond with the post\'s json when the post exists', function (done) {
      request(app)
        .get('/posts/' + String(post._id))
        .expect(200)
        .expect({
          id: String(post._id),
          type: 'text',
          title: 'What\'s MetaClass',
          body: 'Just dark magic',
          author: {
            id: String(user._id),
            name: 'Joe',
            email: 'joe@example.com',
            info: 'This guy is lazy',
            avatar_url: null,
            created_at: user._id.getTimestamp().toISOString()
          },
          event: {
            id: String(event._id),
            name: 'PyCon',
            description: 'Python Conference',
            latitude: 37.3894,
            longitude: -122.0819,
            start_time: null,
            end_time: null,
            created_at: event._id.getTimestamp().toISOString()
          },
          comments: [{ 
            id: String(comment._id),
            body: 'Awesome',
            author: {
              id: String(user._id),
              name: 'Joe',
              email: 'joe@example.com',
              info: 'This guy is lazy',
              avatar_url: null,
              created_at: user._id.getTimestamp().toISOString()
            },
            created_at: comment._id.getTimestamp().toISOString()
          }],
          created_at: post._id.getTimestamp().toISOString()
        })
        .end(done);
    });
  });

  describe('POST /posts', function () {
    it('should respond with 401 if user is not logged in', function (done) {
      request(app)
        .post('/posts')
        .send({
          title: 'JsConf',
          body: 'Cool',
          event: String(event._id),
        })
        .expect(401)
        .end(done);
    });
  });
});
