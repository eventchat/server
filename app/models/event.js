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

var Event = mongoose.model('Event', EventSchema);
module.exports = Event;
