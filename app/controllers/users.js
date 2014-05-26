var User = require('../models/user');

exports.show = function (req, res) {
  var id = req.params.id;

  User.findById(req.params.id, function (err, user) {
    if (err) { 
      return res.send(404, {
        message: 'Cannot find user with ID: ' + id
      });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      info: user.info,
      avatar_url: user.avatar_url
    });
  });
};

exports.create = function (req, res) {
  var user = new User({
    name: req.body.name,
    email: req.body.email,
    info: req.body.info,
    password: req.body.password
  });
  user.save(function (err) {
    if (err) {
      return res.send(400, {
        message: err
      });
    }

    res.send(200);
  });
};
