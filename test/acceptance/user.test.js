/* globals describe, it, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var User     = require('../../app/models/user');
var config   = require('../../config');

mongoose.connect(config.db.test.path);

describe('User API', function () {

  var id;

  beforeEach(function (done) {
    // clear the database, then populate sample data
    User.remove(function () {
      var user = new User({
        name: 'Joe',
        email: 'joe@example.com',
        info: 'This guy is lazy',
        password: '123456'
      });
      user.save(function () {
        id = String(user._id);
        done();
      });
    });
  });

  after(function () {
    mongoose.disconnect();
  });


  describe('GET /users/:user_id', function () {

    it('should respond with the user\'s json when the user exists', function (done) {
      request(app)
        .get('/users/' + id)
        .expect({
          id: id,
          name: 'Joe',
          email: 'joe@example.com',
          info: 'This guy is lazy',
          avatar_url: null
        })
        .end(done);
    });

  });
});
