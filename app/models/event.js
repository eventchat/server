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
  startTime: {
    type: Date
  },
  endTime: {
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
    start_time: this.startTime ? this.startTime.toISOString() : null,
    end_time: this.endTime ? this.endTime.toISOString() : null
  };
};

var Event = mongoose.model('Event', EventSchema);
module.exports = Event;
