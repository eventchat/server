var async         = require('async');
var User          = require('../models/user');
var Notifications = require('./notifications');
var Friendship    = require('../models/friendship');

exports.index = function (req, res) {
  var id = req.params.user_id;

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

      res.json(users);
    });
  });
};

exports.create = function (req, res) {
  var user = req.session.user;
  if (!user) {
    return res.send(401);
  }

  var id = req.params.user_id;

  Friendship.find({
    $or: [
      { from: id, to: user.id }, 
      { from: user.id, to: id },
    ],
  }, function (err, friendships) {
    if (friendships.length === 0) {
      // create friend request
      Notifications.create(id, 'friend', JSON.stringify(user));

      (new Friendship({
        from: user.id,
        to: id,
        status: 'pending'
      })).save(function () {
        res.send(200);
      });
    } else if (friendships.length === 1) {
      var f = friendships[0];
      if (f.from === user.id) {
        // friend request already sent
        return res.send(200);
      } else {
        // acknowlege friendship request
        Friendship.findByIdAndUpdate(f._id, {
          $set: {
            status: 'confirmed'
          }
        }, function () {
          res.send(200);
        });
      }
    } else {
      console.error('should not reach here');
    }
  });
};
