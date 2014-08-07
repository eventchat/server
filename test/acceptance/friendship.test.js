/* globals describe, it, before, beforeEach, after */

var async    = require('async');
var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var redis    = require('redis').createClient();
var User     = require('../../app/models/user');
var config   = require('../../config');

describe('Friend API', function () {

  var user;
  var user2;
  var agent;
  var agent2;

  before(function (done) {
    mongoose.connect(config.DB_URL);

    // clear the database, then populate sample data
    async.series([
      function (callback) {
        redis.flushall(function () {
          callback();
        });
      },
      function (callback) {
        User.remove(function () {
          callback();
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
          callback();
        });
      },
      function (callback) {
        user2 = new User({
          name: 'Lyman',
          email: 'lyman@example.com',
          info: 'This guy is lazy',
          password: '123456'
        });
        user2.save(function () {
          callback();
        });
      },
      function (callback) {
        agent = request.agent(app);
        agent
          .post('/session')
          .send({
            email: 'joe@example.com',
            password: '123456'
          })
          .end(callback);
      },
      function (callback) {
        agent2 = request.agent(app);
        agent2
          .post('/session')
          .send({
            email: 'lyman@example.com',
            password: '123456'
          })
          .end(callback);
      }
    ], function () {
      done();
    });
  });

  after(function () {
    mongoose.disconnect();
  });

  describe('GET /users/:user_id/friends', function () {
    it('should respond with an empty array when the user does not have friends', function (done) {
      agent
        .get('/users/' + user._id + '/friends')
        .expect(200)
        .expect([])
        .end(done);
    });
  });

  describe('POST /users/:user_id/friends', function () {
    it('should respond with 200 when the user sends a friend request', function (done) {
      agent
        .post('/users/' + user2._id + '/friends')
        .expect(200)
        .end(done);
    });
  });

  describe('GET /notifications', function () {
    it('should send the target user a friend request notification', function (done) {
      agent2
        .get('/notifications')
        .expect(200)
        .expect(function (res) {
          res.body.should.have.length(1);
          res.body[0].should.have.properties({
            type: 'friend',
            body: JSON.stringify(user),
            is_read: false
          });
        })
        .end(done);
    });
  });

  describe('GET /users/:user_id/friends', function () {
    it('should still return an empty array due to unconfirmed frienships', function (done) {
      agent
        .get('/users/' + user._id + '/friends')
        .expect(200)
        .expect([])
        .end(done);
    });
  });

  describe('POST /users/:user_id/friends', function () {
    it('should be able to confirm friendships', function (done) {
      agent2
        .post('/users/' + user._id + '/friends')
        .expect(200)
        .end(done);
    });
  });

  describe('GET /users/:user_id/friends', function () {
    it('should be able to return confirmed friendships', function (done) {
      async.parallel([
        function (callback) {
          agent
            .get('/users/' + user._id + '/friends')
            .expect(200)
            .expect([
              user2.toJSON()
            ])
            .end(callback);
        },
        function (callback) {
          agent
            .get('/users/' + user2._id + '/friends')
            .expect(200)
            .expect([
              user.toJSON()
            ])
            .end(callback);
        }
      ], function (err) {
        done(err);
      });
    });
  });
});
