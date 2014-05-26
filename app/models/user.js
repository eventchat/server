var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');
var Schema   = mongoose.Schema;


var UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: {
      unique: true 
    }
  },
  email: {
    type: String,
    required: true
  },

  // NOTE: the password is securely stored using bcrypt.
  // See the pre-save hook below.
  password: {
    type: String,
    required: true
  }
});


// generate password hash when creating a new user or changing
// the password
UserSchema.pre('save', function (next) {
  var user = this;

  if (!user.isModified('password')) { return next(); }

  bcrypt.genSalt(function (err, salt) {
    if (err) { return next(err); }

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) { return next(err); }

      user.password = hash;
      next();
    });
  });
});


// method to determine whether the given password matches
// the stored hashed password
UserSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, function (err, match) {
    if (err) { return callback(err); }

    callback(null, match);
  });
};


var User = mongoose.model('User', UserSchema);
module.exports = User;
