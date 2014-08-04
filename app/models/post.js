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
  }],
  liked_by: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
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
    liked_by: this.liked_by.map(function (u) { return u.toJSON(); }),
    created_at: this._id.getTimestamp().toISOString()
  };
};

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;
