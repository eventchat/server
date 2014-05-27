var Post = require('../models/post');

exports.show = function (req, res) {
  var id = req.params.id;

  Post
    .findById(req.params.id)
    .populate('author event')
    .exec(function (err, post) {
      if (err || !post) { 
        return res.send(404, {
          message: 'Cannot find post with ID: ' + id
        });
      }

      res.json(post.toJSON());
    });
};
