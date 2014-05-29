var User = require('../models/user');


exports.create = function (req, res) {
  User.findOne({ name: req.body.name }, function (err, user) {
    if (err || !user) {
      return res.send(404, {
        message: 'Cannot find user with name: ' + req.body.name
      });
    }

    user.comparePassword(req.body.password, function (err, match) {
      if (match) {
        return res.send(200);
      }
      res.send(401, {
        message: 'Wrong username or password'
      });
    });
  });
};
