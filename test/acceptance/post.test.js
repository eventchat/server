/* globals describe, it, before, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var User     = require('../../app/models/user');
var Event    = require('../../app/models/event');
var Post     = require('../../app/models/post');
var config   = require('../../config');


describe('Post API', function () {

  var user;
  var event;
  var post;

  before(function () {
    mongoose.connect(config.db.test.path);
  });

  beforeEach(function (done) {
    // clear the database, then populate sample data
    User.remove(function () {
      Event.remove(function () {
        Post.remove(function () {
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
              post = new Post({
                type: 'text',
                title: 'What\'s MetaClass',
                body: 'Just dark magic',
                event: event._id,
                author: user._id
              });
              post.save(done);
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
        .expect(function (res) {
          res.status.should.eql(200);

          res.body.should.have.properties({
            id: String(post._id),
            title: 'What\'s MetaClass',
            body: 'Just dark magic',
            author: user.toJSON(),
            event: event.toJSON(),
            comments: []
          });
          res.body.should.have.property('created_at');
        })
        .end(done);
    });
  });
});
