const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  venue_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: false
});

const Venue = mongoose.model('Venue', venueSchema);
module.exports = Venue;