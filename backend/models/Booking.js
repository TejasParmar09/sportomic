const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  booking_id: {
    type: Number,
    required: true,
    unique: true
  },
  venue_id: {
    type: Number,
    required: true,
    ref: 'Venue'
  },
  sport_id: {
    type: Number,
    required: true
  },
  member_id: {
    type: Number,
    required: true,
    ref: 'Member'
  },
  booking_date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  coupon_code: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Completed', 'Cancelled', 'Pending'],
    default: 'Pending'
  }
}, {
  timestamps: false
});

// Index for faster queries
bookingSchema.index({ venue_id: 1, booking_date: 1 });
bookingSchema.index({ member_id: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;