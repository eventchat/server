var async = require('async');
var Event = require('../models/event');
var User = require('../models/user');

function populateEvent(event, callback) {
  event.populate('organizer', function (err) {
    callback(err, event.toJSON());
  });
}
exports.populateEvent = populateEvent;

exports.show = function (req, res) {
  var id = req.params.id;

  Event.findById(id, function (err, event) {
    if (err || !event) {
      return res.send(404, {
        message: 'Cannot find event with ID: ' + id
      });
    }

    populateEvent(event, function (err, event) {
      res.json(event);
    });
  });
};

exports.create = function (req, res) {
  var user = req.session.user;
  if (!user) {
    return res.send(400);
  }

  var event = new Event({
    name: req.body.name,
    description: req.body.description,
    location: [ req.body.longitude, req.body.latitude ],
    address: req.body.address,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    organizer: user.id,
    attendees: [user.id]
  });
  event.save(function (err) {
    if (err) {
      return res.send(400, {
        message: err
      });
    }

    populateEvent(event, function (err, event) {
      res.json(event);
    });
  });
};

exports.search = function (req, res) {
  var longitude = req.query.longitude;
  var latitude = req.query.latitude;
  var maxDistance = req.query.max_distance || 500;

  // find events within the range
  Event.find({
    location: {
      $near: [ longitude, latitude ],
      $maxDistance: maxDistance / 6.371e10 // convert from meter to radian
    }
  }, function (err, events) {
    if (err || !events) {
      return res.send(404);
    }

    async.map(events, populateEvent, function (err, events) {
      res.json(events);
    });
  });
};

exports.indexAttendees = function (req, res) {
  var id = req.params.id;

  Event.findById(id, function (err, event) {
    if (err || !event) {
      return res.send(404, {
        message: 'Cannot find event with ID: ' + id
      });
    }

    event.populate('attendees', function (err) {
      res.json(event.attendees);
    });
  });
};

exports.joinEvent = function (req, res) {
  var id = req.params.id;
  var user = req.session.user;

  if (!user) {
    return res.send(401);
  }

  Event.findById(id, function (err, event) {
    if (err || !event) {
      return res.send(404, {
        message: 'Cannot find event with ID: ' + id
      });
    }

    event.attendees.push(user.id);
    event.save(function (err) {
      if (err) {
        return res.send(400, {
          message: err
        });
      }

      res.send(200);
    });
  });
};

exports.indexByUser = function (req, res) {
  var id = req.params.user_id;

  Event.find({ attendees: { $in: [id] } }, function (err, events) {
    if (err) { return res.send(400); }

    async.map(events, populateEvent, function (err, events) {
      res.json(events);
    });
  });
};
