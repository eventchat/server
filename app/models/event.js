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
    latitude: this.location[0],
    longitude: this.location[1],
    start_time: this.start_time ? this.start_time.toISOString() : null,
    end_time: this.end_time ? this.end_time.toISOString() : null,
    created_at: this._id.getTimestamp().toISOString()
  };
};

var Event = mongoose.model('Event', EventSchema);
module.exports = Event;
