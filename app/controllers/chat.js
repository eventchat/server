var config = require('../../config');
var redis = require('redis-url').connect(config.REDIS_URL);
var User = require('../models/user');


// map from user id to connection
var connections = {};

exports.create = function (req, res) {
  var from = req.session.user;
  if (!from) {
    return res.send(401);
  }

  var toId = req.body.to;
  User.findById(toId, function (err, user) {
    if (err || !user) {
      return res.send(404);
    }

    var message = {
      message: req.body.message,
      from: from,
      created_at: (new Date()).toISOString()
    };

    // if the target user is connected,
    // then send the message to the user directly,
    // else store the message in redis
    if (connections[toId]) {
      connections[toId].json([message]);
      delete connections[toId];
    } else {
      redis.rpush(toId, JSON.stringify({
        message: req.body.message,
        from: from
      }));
    }

    return res.send(200);
  });
};

exports.show = function (req, res) {
  var user = req.session.user;
  if (!user) {
    return res.send(401);
  }

  var id = user.id;

  // if there are unread messages,
  // then send them to the current user,
  // else hold the connection and await new messages
  redis.llen(id, function (err, len) {
    if (err) {
      return res.send(err);
    }
    if (len) {
      redis
        // start transaction
        .multi()
        // retrieve all messages
        .lrange(id, 0, -1, function (err, msgs) {
          res.json(msgs.map(JSON.parse));
        })
        // delete list
        .del(id)
        // execute transaction
        .exec();
    } else {
      connections[id] = res;

      res.socket.once('end', function () {
        delete connections[id];
      });
    }
  });
};
