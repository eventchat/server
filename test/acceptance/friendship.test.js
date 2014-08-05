/* globals describe, it, before, beforeEach, after */

var async    = require('async');
var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var User     = require('../../app/models/user');
var config   = require('../../config');

describe('Friend API', function () {

  var user;
  var user2;
  var agent;
  var agent2;

  before(function () {
    mongoose.connect(config.DB_URL);
  });

  beforeEach(function (done) {
    // clear the database, then populate sample data
    async.series([
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
            name: 'Joe',
            password: '123456'
          })
          .end(callback);
      },
      function (callback) {
        agent2 = request.agent(app);
        agent2
          .post('/session')
          .send({
            name: 'Lyman',
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
    it('should respond with the user\'s friends', function (done) {
      agent
        .get('/users/' + user._id + '/friends')
        .expect(200)
        .expect([])
        .end(done);
    });
  });
});
