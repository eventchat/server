/* globals describe, it, before, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var Event    = require('../../app/models/event');
var User     = require('../../app/models/user');
var config   = require('../../config');


describe('Event API', function () {

  var event;
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
      user.save(function () {
        Event.remove(function () {
          event = new Event({
            organizer: user._id,
            name: 'Pycon',
            description: 'Python Conference',
            location: [ -122.0819, 37.3894 ],
            address: '777 W MiddleField Rd. Mountain View, CA, 94043'
          });
          event.save(done);
        });
      });
    });
  });

  after(function () {
    mongoose.disconnect();
  });


  describe('GET /events/:event_id', function () {
    it('should respond with the event\'s json when the event exists', function (done) {
      request(app)
        .get('/events/' + String(event._id))
        .expect(200)
        .expect({
          organizer: {
            id: String(user._id),
            name: 'Joe',
            email: 'joe@example.com',
            info: 'This guy is lazy',
            avatar_url: null,
            created_at: user._id.getTimestamp().toISOString()
          },
          id: String(event._id),
          name: 'Pycon',
          description: 'Python Conference',
          longitude: -122.0819,
          latitude: 37.3894,
          address: '777 W MiddleField Rd. Mountain View, CA, 94043',
          start_time: null,
          end_time: null,
          created_at: event._id.getTimestamp().toISOString()
        })
        .end(done);
    });

    it('should respond with 404 when the event does not exist', function (done) {
      request(app)
        .get('/events/noentry')
        .expect(404, {
          message: 'Cannot find event with ID: noentry'
        })
        .end(done);
    });
  });

  describe('POST /events', function () {
    it('should respond with 200 when successfully created the event', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          email: 'joe@example.com',
          password: '123456'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          agent
            .post('/events')
            .send({
              name: 'JsConf',
              description: 'JavaScript Conference',
              longitude: -122.0819,
              latitude: 37.3894,
              address: '777 W MiddleField Rd. Mountain View, CA, 94043'
            })
            .expect(200)
            .expect(function (res) {
              res.body.should.have.properties({
                organizer: {
                  id: String(user._id),
                  name: 'Joe',
                  email: 'joe@example.com',
                  info: 'This guy is lazy',
                  avatar_url: null,
                  created_at: user._id.getTimestamp().toISOString()
                },
                name: 'JsConf',
                description: 'JavaScript Conference',
                longitude: -122.0819,
                latitude: 37.3894,
                address: '777 W MiddleField Rd. Mountain View, CA, 94043',
                start_time: null,
                end_time: null,
              });
            })
            .end(done);
        });
    });
  });

  describe('GET /events/search', function () {
    it('should respond with the events within the specified area', function (done) {
      request(app)
        .get('/events/search')
        .query({
          longitude: -122.0819,
          latitude: 37.3894,
          max_distance: 1000
        })
        .expect(200)
        .expect([{
          organizer: {
            id: String(user._id),
            name: 'Joe',
            email: 'joe@example.com',
            info: 'This guy is lazy',
            avatar_url: null,
            created_at: user._id.getTimestamp().toISOString()
          },
          id: String(event._id),
          name: 'Pycon',
          description: 'Python Conference',
          longitude: -122.0819,
          latitude: 37.3894,
          address: '777 W MiddleField Rd. Mountain View, CA, 94043',
          start_time: null,
          end_time: null,
          created_at: event._id.getTimestamp().toISOString()
        }])
        .end(done);
    });
  });

  describe('POST /events/:event_id/attendees', function () {
    it('should register the current user to the attendees', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          email: 'joe@example.com',
          password: '123456'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          agent
            .post('/events/' + String(event._id) + '/attendees')
            .expect(200)
            .end(done);
        });
    });
  });

  describe('GET /events/:event_id/attendees', function () {
    it('should get the attendees of the event', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          email: 'joe@example.com',
          password: '123456'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          agent
            .post('/events/' + String(event._id) + '/attendees')
            .expect(200)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              agent
                .get('/events/' + String(event._id) + '/attendees')
                .expect(200)
                .expect([{
                  id: String(user._id),
                  name: 'Joe',
                  email: 'joe@example.com',
                  info: 'This guy is lazy',
                  avatar_url: null,
                  created_at: user._id.getTimestamp().toISOString()
                }])
                .end(done);
            });
        });
    });
  });

  describe('GET /users/:user_id/events', function () {
    it('should get the events that a user attends', function (done) {
      var agent = request.agent(app);

      agent
        .post('/session')
        .send({
          email: 'joe@example.com',
          password: '123456'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }

          agent
            .post('/events/' + String(event._id) + '/attendees')
            .expect(200)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              agent
                .get('/users/' + String(user._id) + '/events')
                .expect(200)
                .expect([{
                  organizer: {
                    id: String(user._id),
                    name: 'Joe',
                    email: 'joe@example.com',
                    info: 'This guy is lazy',
                    avatar_url: null,
                    created_at: user._id.getTimestamp().toISOString()
                  },
                  id: String(event._id),
                  name: 'Pycon',
                  description: 'Python Conference',
                  longitude: -122.0819,
                  latitude: 37.3894,
                  address: '777 W MiddleField Rd. Mountain View, CA, 94043',
                  start_time: null,
                  end_time: null,
                  created_at: event._id.getTimestamp().toISOString()
                }])
                .end(done);
            });
        });
    });
  });
});
