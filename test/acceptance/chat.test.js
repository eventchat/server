/* globals describe, it, before, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var async    = require('async');
var redis    = require('redis').createClient();
var User     = require('../../app/models/user');
var app      = require('../../app');
var config   = require('../../config');


describe('Chat API', function () {

  var alice;
  var bob;

  before(function () {
    mongoose.connect(config.DB_URL);
  });

  after(function () {
    mongoose.disconnect();
  });

  beforeEach(function (done) {
    // clear the database, then populate sample data
    redis.flushall(function () {
      User.remove(function () {
        alice = new User({
          name: 'Alice',
          email: 'alice@example.com',
          info: 'This guy is lazy',
          password: '123456'
        });
        alice.save(function () {
          bob = new User({
            name: 'Bob',
            email: 'bob@example.com',
            info: 'This guy is also lazy',
            password: '123456'
          });
          bob.save(function () {
            done();
          });
        });
      });
    });
  });

  describe('POST /chat', function () {
    it('should return immediately with 200 if user id exists', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          name: 'Alice',
          password: '123456'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          agent
            .post('/chat')
            .send({
              message: 'hello',
              to: String(alice._id)
            })
            .expect(200, done);
        });
    });
  });

  describe('GET /chat', function () {
    it('should return unread messages', function (done) {
      var aliceAgent = request.agent(app);
      var bobAgent   = request.agent(app);

      async.series([
        function (callback) {
          aliceAgent
            .post('/session')
            .send({
              name: 'Alice',
              password: '123456'
            })
            .expect(200)
            .end(callback);
        },
        function (callback) {
          aliceAgent
            .post('/chat')
            .send({
              message: 'hello',
              to: String(bob.id)
            })
            .expect(200)
            .end(callback);
        },
        function (callback) {
          bobAgent
            .post('/session')
            .send({
              name: 'Bob',
              password: '123456'
            })
            .expect(200)
            .end(callback);
        },
        function (callback) {
          bobAgent
            .get('/chat')
            .expect(function (res) {
              res.body.should.be.instanceof(Array);
              res.body.should.have.lengthOf(1);
              res.body[0].should.have.properties({
                from: alice.toJSON()
              });
            })
            .end(callback);
        }
      ], function (err) {
        done(err);
      });
    });
  });
});
