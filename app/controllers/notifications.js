var User = require('../models/user');
var config = require('../../config');
var url = require('url').parse(config.REDIS_URL);
var redis = require('redis').createClient(url.port, url.hostname);

if (url.auth) {
  redis.auth(url.auth.split(':')[1]);
}

var NOTIFICATION_REDIS_PREFIX = '__N__';

// map from user id to connection
var connections = {};

exports.create = function (userId, type, body) {
  var toId = NOTIFICATION_REDIS_PREFIX + userId;

  var message = {
    type: type,
    body: body,
    is_read: false,
    created_at: (new Date()).toISOString()
  };

  // if the target user is connected,
  // then send the message to the user directly,
  // else store the message in redis
  if (connections[toId]) {
    connections[toId].json([message]);
    delete connections[toId];
  } else {
    redis.rpush(toId, JSON.stringify(message));
  }
};

exports.index = function (req, res) {
  var user = req.session.user;
  if (!user) {
    return res.send(401);
  }

  var id = NOTIFICATION_REDIS_PREFIX + user.id;

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
