var async = require('async');
var Post = require('../models/post');

exports.show = function (req, res) {
  var id = req.params.id;

  Post
    .findById(req.params.id)
    .populate('author event comments')
    .exec(function (err, post) {
      if (err || !post) { 
        return res.send(404, {
          message: 'Cannot find post with ID: ' + id
        });
      }

      // populate comments' authors
      async.each(post.comments, function (comment, done) {
        comment.populate('author', done);
      }, function (err) {
        res.json(post.toJSON());
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

    post.populate('author event', function () {
      res.send(post.toJSON());
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
