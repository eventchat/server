/* globals describe, it, before, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var User     = require('../../app/models/user');
var Event    = require('../../app/models/event');
var Post     = require('../../app/models/post');
var Comment  = require('../../app/models/comment');
var config   = require('../../config');


describe('Comment API', function () {

  var user;
  var user2;
  var event;
  var comment;
  var post;

  before(function () {
    mongoose.connect(config.DB_URL);
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
              user2 = new User({
                name: 'Lyman',
                email: 'lyman@example.com',
                info: 'This guy is also lazy',
                password: '123456'
              });
              user2.save(function () {
                event = new Event({
                  name: 'PyCon',
                  description: 'Python Conference',
                  location: [-122.0819, 37.3894]
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

  });

  after(function () {
    mongoose.disconnect();
  });

  describe('POST /posts/:post_id/comments', function () {
    it('should respond with 401 when the user is not logged in', function (done) {
      request(app)
        .post('/posts/' + String(post._id) + '/comments')
        .send({
          body: 'awesome post'
        })
        .expect(401)
        .end(done);
    });

    it('should respond with 404 when the post is not found', function (done) {
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
            .post('/posts/12313123123/comments')
            .send({
              body: 'awesome post'
            })
            .expect(404)
            .end(done);
        });
    });

    it('should respond with the updated post when successfully created the comment', function (done) {
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
            .post('/posts/' + String('post._id') + '/comments')
            .send({
              body: 'awesome post'
            })
            .expect(200)
            .expect(function (res) {
              res.body.comments.length.should.eql(2);
            })
            .end(done);
        });
    });
  });
});
