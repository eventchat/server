var User = require('../models/user');

exports.show = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      info: user.info,
      avatar_url: user.avatar_url
    });
  });
};
