var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var CommentSchema = new Schema({
  body: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
});


var Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
