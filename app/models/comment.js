var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;
var UserSchema = require('./user').schema;

var CommentSchema = new Schema({
  body: {
    type: String,
    required: true
  },
  author: {
    type: UserSchema,
    required: true
  },
});


var Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
