/* globals describe, it, beforeEach, after */

var request = require('supertest');
var app     = require('../../app');

describe('Echo API', function () {
  describe('POST /echo', function () {
    it('should respond with the same body as sent', function (done) {
      request(app)
        .post('/echo')
        .send({ foo: 'bar' })
        .expect({ foo: 'bar' })
        .end(done);
    });
  });
});
