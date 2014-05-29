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
