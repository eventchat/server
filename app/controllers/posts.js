var async = require('async');
var Event = require('../models/event');
var Post = require('../models/post');
var User = require('../models/user');
var Comment = require('../models/comment');

function populatePost(post, callback) {
  post.populate('author event comments', function (err) {
    // populate comments' authors
    async.each(post.comments, function (comment, done) {
      comment.populate('author', done);
    }, function (err) {
      callback(err, post.toJSON());
    });
  });
}

exports.show = function (req, res) {
  var id = req.params.id;

  Post.findById(req.params.id, function (err, post) {
    if (err || !post) {
      return res.send(404, {
        message: 'Cannot find post with ID: ' + id
      });
    }

    populatePost(post, function (err, post) {
      res.json(post);
    });
  });
};

exports.create = function (req, res) {
  var user = req.session.user;

  if (!user) {
    return res.send(401);
  }

  var post = new Post({
    title: req.body.title,
    type: req.body.type,
    body: req.body.body,
    event: req.body.event_id,
    author: user.id
  });

  post.save(function (err) {
    if (err) {
      return res.send(400, {
        message: err
      });
    }

    populatePost(post, function (err, post) {
      res.send(post);
    });
  });
};

exports.delete  = function (req, res) {
  Post.findById(req.params.id, function (err, post) {
    if (err || !post) {
      return res.send(404);
    }

    var user = req.session.user;

    if (!user || String(post.author) !== user.id) {
      return res.send(401);
    }

    post.remove(function () {
      res.send(200);
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
    // find posts associated with these events

    var eventIds = events.map(function (e) {
      return e._id;
    });

    Post
      .find({ event: { $in: eventIds } })
      .exec(function (err, posts) {
        async.map(posts, populatePost, function (err, posts) {
          res.send(posts);
        });
      });
  });
};

exports.createComment = function (req, res) {
  var user = req.session.user;

  if (!user) {
    return res.send(401);
  }

  var pid = req.params.post_id;
  Post.findById(pid, function (err, post) {
    if (err || !post) {
      return res.send(404, {
        message: 'Cannot find post with ID: ' + pid
      });
    }

    var comment = new Comment({
      author: user.id,
      body: req.body.body
    });

    comment.save(function (err) {
      if (err) { res.send(500, { message: err }); }

      post.comments.push(comment._id);
      post.save(function () {
        if (err) { res.send(500, { message: err }); }

        populatePost(post, function (err, post) {
          if (err) { res.send(500, { message: err }); }
          res.json(post);
        });
      });
    });
  });
};

exports.indexByUser = function (req, res) {
  var id = req.params.id;
  Post.find({ author: id }, function (err, posts) {
    if (err) { res.send(500, { message: err }); }

    async.map(posts, populatePost, function (err, posts) {
      res.send(posts);
    });
  });
};
