/* globals describe, it, before, beforeEach, after */

var mongoose = require('mongoose');
var request  = require('supertest');
var app      = require('../../app');
var Event    = require('../../app/models/event');
var config   = require('../../config');


describe('Event API', function () {

  var event;

  before(function () {
    mongoose.connect(config.DB_URL);
  });

  beforeEach(function (done) {
    // clear the database, then populate sample data
    Event.remove(function () {
      event = new Event({
        name: 'Pycon',
        description: 'Python Conference',
        location: [ 37.3894, -122.0819 ]
      });
      event.save(function () {
        done();
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
          id: String(event._id),
          name: 'Pycon',
          description: 'Python Conference',
          latitude: 37.3894,
          longitude: -122.0819,
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
      request(app)
        .post('/events')
        .send({
          name: 'JsConf',
          description: 'JavaScript Conference',
          latitude: 37.3894,
          longitude: -122.0819
        })
        .expect(200)
        .end(done);
    });
  });
});
