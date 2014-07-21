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
        location: [ -122.0819, 37.3894 ]
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
          longitude: -122.0819,
          latitude: 37.3894,
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
          longitude: -122.0819,
          latitude: 37.3894
        })
        .expect(200)
        .expect(function (res) {
          res.body.should.have.properties({
            name: 'JsConf',
            description: 'JavaScript Conference',
            longitude: -122.0819,
            latitude: 37.3894,
            start_time: null,
            end_time: null,
          });
        })
        .end(done);
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
          id: String(event._id),
          name: 'Pycon',
          description: 'Python Conference',
          longitude: -122.0819,
          latitude: 37.3894,
          start_time: null,
          end_time: null,
          created_at: event._id.getTimestamp().toISOString()
        }])
        .end(done);
    });
  });
});
