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
