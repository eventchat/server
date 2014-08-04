/* globals describe, it, before, beforeEach, after */

var async    = require('async');
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
  var user2;
  var event;
  var comment;
  var post;

  before(function () {
    mongoose.connect(config.DB_URL);
  });

  beforeEach(function (done) {
    async.series([
      function (callback) {
        User.remove(function () {
          callback(null);
        });
      },
      function (callback) {
        User.remove(function () {
          callback(null);
        });
      },
      function (callback) {
        Post.remove(function () {
          callback(null);
        });
      },
      function (callback) {
        Comment.remove(function () {
          callback(null);
        });
      },
      function (callback) {
        Event.remove(function () {
          callback(null);
        });
      },
      function (callback) {
        user = new User({
          name: 'Joe',
          email: 'joe@example.com',
          info: 'This guy is lazy',
          password: '123456'
        });
        user.save(function () {
          callback(null);
        });
      },
      function (callback) {
        user2 = new User({
          name: 'Lyman',
          email: 'lyman@example.com',
          info: 'This guy is also lazy',
          password: '123456'
        });
        user2.save(function () {
          callback(null);
        });
      },
      function (callback) {
        event = new Event({
          organizer: user._id,
          name: 'PyCon',
          description: 'Python Conference',
          location: [-122.0819, 37.3894],
          address: '777 W MiddleField Rd. Mountain View, CA, 94043'
        });
        event.save(function () {
          callback(null);
        });
      },
      function (callback) {
        comment = new Comment({
          author: user._id,
          body: 'Awesome'
        });
        comment.save(function () {
          callback(null);
        });
      },
      function (callback) {
        post = new Post({
          type: 'text',
          title: 'What\'s MetaClass',
          body: 'Just dark magic',
          event: event._id,
          author: user._id,
          comments: [comment._id],
          liked_by: [user._id]
        });
        post.save(function () {
          callback(null);
        });
      }
    ], done);
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
            organizer: {
              id: String(user._id),
              name: 'Joe',
              email: 'joe@example.com',
              info: 'This guy is lazy',
              avatar_url: null,
              created_at: user._id.getTimestamp().toISOString()
            },
            id: String(event._id),
            name: 'PyCon',
            description: 'Python Conference',
            longitude: -122.0819,
            latitude: 37.3894,
            address: '777 W MiddleField Rd. Mountain View, CA, 94043',
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
          liked_by: [{
            id: String(user._id),
            name: 'Joe',
            email: 'joe@example.com',
            info: 'This guy is lazy',
            avatar_url: null,
            created_at: user._id.getTimestamp().toISOString()
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

    it('should respond with the saved post\'s json when successfully created the post', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          name: 'Joe',
          password: '123456'
        })
        .end(function (err, res) {
          agent
            .post('/posts')
            .send({
              title: 'Hello',
              type: 'text',
              body: 'Hi all',
              event_id: String(event._id),
            })
            .expect(200)
            .expect(function (res) {
              res.body.should.have.properties({
                type: 'text',
                title: 'Hello',
                body: 'Hi all',
                author: {
                  id: String(user._id),
                  name: 'Joe',
                  email: 'joe@example.com',
                  info: 'This guy is lazy',
                  avatar_url: null,
                  created_at: user._id.getTimestamp().toISOString()
                },
                event: {
                  organizer: {
                    id: String(user._id),
                    name: 'Joe',
                    email: 'joe@example.com',
                    info: 'This guy is lazy',
                    avatar_url: null,
                    created_at: user._id.getTimestamp().toISOString()
                  },
                  id: String(event._id),
                  name: 'PyCon',
                  description: 'Python Conference',
                  longitude: -122.0819,
                  latitude: 37.3894,
                  address: '777 W MiddleField Rd. Mountain View, CA, 94043',
                  start_time: null,
                  end_time: null,
                  created_at: event._id.getTimestamp().toISOString()
                },
                comments: [],
                liked_by: []
              });
            })
            .end(done);
        });
    });
  });

  describe('DELETE /posts/:post_id', function () {
    it('should return 401 if the user is not signed in', function (done) {
      request(app)
        .delete('/posts/' + String(post._id))
        .expect(401)
        .end(done);
    });

    it('should return 401 if the post does not belong to the current user', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          name: 'Lyman',
          password: '123456'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          agent
            .delete('/posts/' + String(post._id))
            .expect(401)
            .end(done);
        });
    });

    it('should return 404 if the post does not exist', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          name: 'Lyman',
          password: '123456'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          agent
            .delete('/posts/123')
            .expect(404)
            .end(done);
        });
    });
  });

  describe('GET /posts/search', function () {
    it('should respond with the posts within the specified area', function (done) {
      request(app)
        .get('/posts/search')
        .query({
          longitude: -122.0819,
          latitude: 37.3894, // test post latitude is 37.3894
          max_distance: 1000
        })
        .expect(200)
        .expect([{
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
            organizer: {
              id: String(user._id),
              name: 'Joe',
              email: 'joe@example.com',
              info: 'This guy is lazy',
              avatar_url: null,
              created_at: user._id.getTimestamp().toISOString()
            },
            id: String(event._id),
            name: 'PyCon',
            description: 'Python Conference',
            longitude: -122.0819,
            latitude: 37.3894,
            address: '777 W MiddleField Rd. Mountain View, CA, 94043',
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
          liked_by: [{
            id: String(user._id),
            name: 'Joe',
            email: 'joe@example.com',
            info: 'This guy is lazy',
            avatar_url: null,
            created_at: user._id.getTimestamp().toISOString()
          }],
          created_at: post._id.getTimestamp().toISOString()
        }])
        .end(done);
    });

    it('should not respond with the posts outside the specified area', function (done) {
      request(app)
        .get('/posts/search')
        .query({
          longitude: -122.0819,
          latitude: 57.3894, // test post latitude is 37.3894
          max_distance: 100
        })
        .expect(200)
        .expect([])
        .end(done);
    });
  });

  describe('GET /users/:id/posts', function () {
    it('should respond with the posts authored by the given user', function (done) {
      request(app)
        .get('/users/' + String(user._id) + '/posts')
        .expect([{
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
            organizer: {
              id: String(user._id),
              name: 'Joe',
              email: 'joe@example.com',
              info: 'This guy is lazy',
              avatar_url: null,
              created_at: user._id.getTimestamp().toISOString()
            },
            id: String(event._id),
            name: 'PyCon',
            description: 'Python Conference',
            longitude: -122.0819,
            latitude: 37.3894,
            address: '777 W MiddleField Rd. Mountain View, CA, 94043',
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
          liked_by: [{
            id: String(user._id),
            name: 'Joe',
            email: 'joe@example.com',
            info: 'This guy is lazy',
            avatar_url: null,
            created_at: user._id.getTimestamp().toISOString()
          }],
          created_at: post._id.getTimestamp().toISOString()
        }])
        .end(done);
    });
  });
});
