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

CommentSchema.methods.toJSON = function () {
  return {
    id: String(this._id),
    body: this.body,
    author: this.author.toJSON(),
    created_at: this._id.getTimestamp().toISOString()
  };
};


var Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
