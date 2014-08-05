var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;

var FriendshipSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String, // 'pending' | 'confirmed'
    required: true
  }
});

var Friendship = mongoose.model('Friendship', FriendshipSchema);
module.exports = Friendship;
