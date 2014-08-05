var mongoose = require('mongoose');
var Schema   = mongoose.Schema;


var NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  is_read: {
    type: Boolean,
    required: true,
    default: false
  },
});

NotificationSchema.methods.toJSON = function () {
  return {
    type: this.type,
    body: this.body,
    is_read: this.is_read,
    created_at: this._id.getTimestamp().toISOString()
  };
};


var Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
