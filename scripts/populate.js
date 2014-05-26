var async    = require('async');
var mongoose = require('mongoose');
var config   = require('../config');
var User     = require('../app/models/user');

mongoose.connect(config.db.test.path);

var users = [
  {
    name: 'Joe',
    email: 'joe@example.com',
    password: '123456',
    info: 'This guy is lazy; he left nothing here.'
  },
  {
    name: 'Claud',
    email: 'claud@example.com',
    password: 'qwerty',
    info: 'Product Manager'
  }
];

function saveUser(user, callback) {
  (new User(user)).save(callback);
}

User.remove(function () {
  async.forEach(users, saveUser, function (err) {
    mongoose.disconnect();
  });
});

