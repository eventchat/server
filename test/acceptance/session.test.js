/* globals describe, it, before, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var User     = require('../../app/models/user');
var config   = require('../../config');


describe('Session API', function () {

  var user;

  before(function () {
    mongoose.connect(config.DB_URL);
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

    it('should respond with 401 when username and password do not match', function (done) {
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

  describe('GET /session', function () {
    it('should return falsy status before user logged in', function (done) {
      request(app)
        .get('/session')
        .expect(200)
        .expect({
          logged_in: false
        })
        .end(done);
    });

    it('should return truthy status after user logged in', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          name: 'Joe',
          password: '123456'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          agent
            .get('/session')
            .expect(200)
            .expect({
              logged_in: true
            })
            .end(done);
        });
    });
  });

  describe('DELETE /session', function () {
    it('should log the user out', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          name: 'Joe',
          password: '123456'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          agent
            .delete('/session')
            .expect(200)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              agent
                .get('/session')
                .expect(200)
                .expect({
                  logged_in: false
                })
                .end(done);
            });
        });
    });
  });
});
