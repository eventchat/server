var async      = require('async');
var User       = require('../models/user');
var Friendship = require('../models/friendship');

exports.index = function (req, res) {
  var id = req.param.user_id;

  Friendship.find({
    $or: [
      { from: id }, 
      { to: id },
    ],
    status: 'confirmed'
  }, function (err, friendships) {
    if (err) { return res.send(400, { message: err }); }

    var uids = friendships.map(function (f) {
      return String(f.from) === id ? f.to : f.from;
    });
    User.find({
      _id: {
        $in: uids
      }
    }, function (err, users) {
      if (err) { return res.send(400, { message: err }); }

      res.json(users.map(function (u) { u.toJSON(); }));
    });
  });
};

exports.create = function (req, res) {
};
