var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;

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
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

PostSchema.methods.toJSON = function () {
  return {
    id: String(this._id),
    type: this.type,
    title: this.title,
    body: this.body,
    author: this.author.toJSON(),
    event: this.event.toJSON(),
    comments: this.comments.map(function (c) { return c.toJSON(); }),
    created_at: this._id.getTimestamp().toISOString()
  };
};

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;
