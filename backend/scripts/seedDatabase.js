const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Venue = require('../models/Venue');
const Member = require('../models/Member');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// Data from the Excel file
const venuesData = [
  { venue_id: 1, name: 'Grand Slam Arena', location: 'North Hills' },
  { venue_id: 2, name: 'City Kickers Turf', location: 'Downtown' },
  { venue_id: 3, name: 'AquaBlue Pool Center', location: 'Westside' },
  { venue_id: 4, name: 'Smash Point Badminton', location: 'East District' },
  { venue_id: 5, name: 'Legends Cricket Ground', location: 'Suburbs' }
];

const membersData = [
  { member_id: 1, name: 'Rahul Sharma', status: 'Active', is_trial_user: false, converted_from_trial: false, join_date: '2025-10-15' },
  { member_id: 2, name: 'Priya Singh', status: 'Active', is_trial_user: true, converted_from_trial: true, join_date: '2025-11-01' },
  { member_id: 3, name: 'Amit Patel', status: 'Inactive', is_trial_user: false, converted_from_trial: false, join_date: '2025-09-10' },
  { member_id: 4, name: 'Sneha Gupta', status: 'Active', is_trial_user: false, converted_from_trial: true, join_date: '2025-11-20' },
  { member_id: 5, name: 'Vikram Malhotra', status: 'Active', is_trial_user: true, converted_from_trial: false, join_date: '2025-12-10' },
  { member_id: 6, name: 'Anjali Desai', status: 'Inactive', is_trial_user: true, converted_from_trial: false, join_date: '2025-11-05' },
  { member_id: 7, name: 'John Doe', status: 'Active', is_trial_user: false, converted_from_trial: false, join_date: '2025-08-15' },
  { member_id: 8, name: 'Sarah Lee', status: 'Active', is_trial_user: true, converted_from_trial: true, join_date: '2025-12-01' }
];

const bookingsData = [
  { booking_id: 1, venue_id: 1, sport_id: 1, member_id: 1, booking_date: '2025-12-12 10:00', amount: 500.00, coupon_code: '', status: 'Completed' },
  { booking_id: 2, venue_id: 2, sport_id: 2, member_id: 2, booking_date: '2025-12-13 14:00', amount: 1200.00, coupon_code: '', status: 'Confirmed' },
  { booking_id: 3, venue_id: 3, sport_id: 3, member_id: 7, booking_date: '2025-12-13 07:00', amount: 270.00, coupon_code: 'EARLYBIRD', status: 'Confirmed' },
  { booking_id: 4, venue_id: 4, sport_id: 4, member_id: 4, booking_date: '2025-12-13 18:00', amount: 200.00, coupon_code: 'WELCOME50', status: 'Confirmed' },
  { booking_id: 5, venue_id: 5, sport_id: 5, member_id: 5, booking_date: '2025-12-14 09:00', amount: 1500.00, coupon_code: '', status: 'Confirmed' },
  { booking_id: 6, venue_id: 1, sport_id: 1, member_id: 1, booking_date: '2025-12-13 10:00', amount: 450.00, coupon_code: 'SAVE10', status: 'Confirmed' },
  { booking_id: 7, venue_id: 2, sport_id: 2, member_id: 8, booking_date: '2025-12-15 16:00', amount: 600.00, coupon_code: '', status: 'Confirmed' },
  { booking_id: 8, venue_id: 3, sport_id: 3, member_id: 3, booking_date: '2025-12-10 15:00', amount: 300.00, coupon_code: '', status: 'Cancelled' }
];

const transactionsData = [
  { transaction_id: 101, booking_id: 1, type: 'Booking', amount: 500.00, status: 'Success', transaction_date: '2025-12-12' },
  { transaction_id: 102, booking_id: 2, type: 'Coaching', amount: 1200.00, status: 'Success', transaction_date: '2025-12-13' },
  { transaction_id: 103, booking_id: 3, type: 'Booking', amount: 270.00, status: 'Success', transaction_date: '2025-12-13' },
  { transaction_id: 104, booking_id: 4, type: 'Booking', amount: 200.00, status: 'Success', transaction_date: '2025-12-13' },
  { transaction_id: 105, booking_id: 5, type: 'Booking', amount: 1500.00, status: 'Success', transaction_date: '2025-12-14' },
  { transaction_id: 106, booking_id: 6, type: 'Booking', amount: 450.00, status: 'Success', transaction_date: '2025-12-13' },
  { transaction_id: 107, booking_id: 7, type: 'Coaching', amount: 600.00, status: 'Dispute', transaction_date: '2025-12-15' },
  { transaction_id: 108, booking_id: 8, type: 'Booking', amount: 300.00, status: 'Refunded', transaction_date: '2025-12-10' }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Clearing existing data...');
    await Venue.deleteMany({});
    await Member.deleteMany({});
    await Booking.deleteMany({});
    await Transaction.deleteMany({});
    
    console.log('Seeding venues...');
    await Venue.insertMany(venuesData);
    
    console.log('Seeding members...');
    await Member.insertMany(membersData);
    
    console.log('Seeding bookings...');
    await Booking.insertMany(bookingsData);
    
    console.log('Seeding transactions...');
    await Transaction.insertMany(transactionsData);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();