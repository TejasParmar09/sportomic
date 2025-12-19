const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  member_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  is_trial_user: {
    type: Boolean,
    default: false
  },
  converted_from_trial: {
    type: Boolean,
    default: false
  },
  join_date: {
    type: Date,
    required: true
  }
}, {
  timestamps: false
});

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;