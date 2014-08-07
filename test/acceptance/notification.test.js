/* globals describe, it, before, beforeEach, after */

var async                  = require('async');
var mongoose               = require('mongoose');
var request                = require('supertest');
var redis                  = require('redis').createClient();
var app                    = require('../../app');
var NotificationController = require('../../app/controllers/notifications');
var User                   = require('../../app/models/user');
var config                 = require('../../config');


describe('Notification API', function () {

  var user;
  var agent;

  before(function (done) {
    mongoose.connect(config.DB_URL);

    redis.flushall(function () {
      User.remove(function () {
        user = new User({
          name: 'Joe',
          email: 'joe@example.com',
          info: 'This guy is lazy',
          password: '123456'
        });
        user.save(function () {
          agent = request.agent(app);
          agent
            .post('/session')
            .send({
              email: 'joe@example.com',
              password: '123456'
            })
            .end(done);
        });
      });
    });
  });

  after(function () {
    mongoose.disconnect();
  });

  describe('Notification API', function () {
    it('should wait for new notifications when there\'s no new notifications', function (done) {
      async.parallel([
        function (callback) {
          setTimeout(function () {
            NotificationController.create(user._id, 'system', 'hello');
            callback(null);
          }, 500);
        },
        function (callback) {
          agent
            .get('/notifications')
            .expect(200)
            .expect(function (res) {
              res.body.should.have.length(1);
              res.body[0].should.have.properties({
                type: 'system',
                body: 'hello'
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
