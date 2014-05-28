/* globals describe, it, before, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var User     = require('../../app/models/user');
var config   = require('../../config');


describe('Session API', function () {

  var user;

  before(function () {
    mongoose.connect(config.db.test.path);
  });

  beforeEach(function (done) {
    // clear the database, then populate sample data
    User.remove(function () {
      user = new User({
        name: 'Joe',
        email: 'joe@example.com',
        info: 'This guy is lazy',
        password: '123456'
      });
      user.save(done);
    });
  });

  after(function () {
    mongoose.disconnect();
  });


  describe('POST /session', function () {
    it('should respond with 200 when username and password match', function (done) {
      request(app)
        .post('/session')
        .send({
          name: 'Joe',
          password: '123456'
        })
        .expect(200)
        .end(done);
    });

    it('should respond with 401 when username and password does not match', function (done) {
      request(app)
        .post('/session')
        .send({
          name: 'Joe',
          password: 'wrongpass'
        })
        .expect(401)
        .end(done);
    });
  });
});
