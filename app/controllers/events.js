var Event = require('../models/event');

exports.show = function (req, res) {
  var id = req.params.id;

  Event.findById(id, function (err, event) {
    if (err || !event) {
      return res.send(404, {
        message: 'Cannot find event with ID: ' + id
      });
    }

    res.json(event.toJSON());
  });
};

exports.create = function (req, res) {
  var event = new Event({
    name: req.body.name,
    description: req.body.description,
    location: [ req.body.longitude, req.body.latitude ],
    address: req.body.address,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
  });
  event.save(function (err) {
    if (err) {
      return res.send(400, {
        message: err
      });
    }

    res.json(event.toJSON());
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

    res.json(events.map(function (e) {
      return e.toJSON();
    }));
  });
};
