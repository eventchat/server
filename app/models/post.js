var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;
var UserSchema    = require('./user').schema;
var CommentSchema = require('./comment').schema;
var EventSchema   = require('./event').schema;

var PostSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: UserSchema,
    required: true
  },
  event: {
    type: EventSchema,
    required: true
  },
  comments: {
    type: [CommentSchema],
    required: true,
    default: []
  }
});

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;
