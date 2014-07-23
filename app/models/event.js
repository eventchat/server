var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;

var EventSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  location: {
    type: [Number],
    index: '2d'
  },
  address: {
    type: String
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  start_time: {
    type: Date
  },
  end_time: {
    type: Date
  }
});

EventSchema.methods.toJSON = function () {
  return {
    id: String(this._id),
    name: this.name,
    description: this.description,
    longitude: this.location[0],
    latitude: this.location[1],
    address: this.address,
    start_time: this.start_time ? this.start_time.toISOString() : null,
    end_time: this.end_time ? this.end_time.toISOString() : null,
    created_at: this._id.getTimestamp().toISOString()
  };
};

var Event = mongoose.model('Event', EventSchema);
module.exports = Event;
