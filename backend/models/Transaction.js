const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transaction_id: {
    type: Number,
    required: true,
    unique: true
  },
  booking_id: {
    type: Number,
    required: true,
    ref: 'Booking'
  },
  type: {
    type: String,
    enum: ['Booking', 'Coaching', 'Refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Success', 'Dispute', 'Refunded', 'Failed'],
    default: 'Success'
  },
  transaction_date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: false
});

// Index for faster queries
transactionSchema.index({ booking_id: 1 });
transactionSchema.index({ status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;