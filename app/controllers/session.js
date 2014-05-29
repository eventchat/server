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

        // NOTE: user will be serialized using the toJSON() method;
        // the restored user will be a plain JS object, instead of
        // an instance of the mongoose Model.
        req.session.user = user;
        return res.send(200);
      }
      res.send(401, {
        message: 'Wrong username or password'
      });
    });
  });
};

exports.show = function (req, res) {
  return res.send({
    logged_in: !!req.session.user
  });
};

exports.delete = function (req, res) {
  delete req.session.user;

  res.send(200);
};
