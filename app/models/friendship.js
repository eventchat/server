var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;

var FriendshipSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

var Friendship = mongoose.model('Friendship', FriendshipSchema);
module.exports = Friendship;
