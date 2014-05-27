/* globals describe, it, before, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var User     = require('../../app/models/user');
var config   = require('../../config');


describe('User API', function () {

  var id;

  before(function () {
    mongoose.connect(config.db.test.path);
  });

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
        .expect(function (res) {
          res.body.should.have.properties({
            id: id,
            name: 'Joe',
            email: 'joe@example.com',
            info: 'This guy is lazy',
            avatar_url: null
          });
          res.body.should.have.property('created_at');
        })
        .end(done);
    });

    it('should respond with 404 when the user does not exist', function (done) {
      request(app)
        .get('/users/noentry')
        .expect(404, {
          message: 'Cannot find user with ID: noentry'
        })
        .end(done);
    });
  });

  describe('POST /users', function () {
    it('should respond with 200 when successfully created the user', function (done) {
      request(app)
        .post('/users')
        .send({
          name: 'Lyman',
          password: '12345',
          email: 'lyman@example.com'
        })
        .expect(200)
        .end(done);
    });

    it('should respond with 400 when the submitted data is invalid', function (done) {
      request(app)
        .post('/users')
        .send({
          name: 'Lyman'
        })
        .expect(400)
        .end(done);
    });
  });
});
