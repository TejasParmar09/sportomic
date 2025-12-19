const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const { status, type, start_date, end_date } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    if (start_date || end_date) {
      filter.transaction_date = {};
      if (start_date) filter.transaction_date.$gte = new Date(start_date);
      if (end_date) filter.transaction_date.$lte = new Date(end_date);
    }
    
    const transactions = await Transaction.find(filter)
      .sort({ transaction_date: -1 })
      .populate('booking_id', 'booking_date amount status', 'Booking');
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transaction_id: req.params.id })
      .populate('booking_id', 'booking_date amount status', 'Booking');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new transaction
router.post('/', async (req, res) => {
  try {
    const { booking_id, type, amount, status } = req.body;
    
    // Check if booking exists
    const booking = await Booking.findOne({ booking_id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Generate new transaction ID
    const lastTransaction = await Transaction.findOne().sort('-transaction_id');
    const newTransactionId = lastTransaction ? lastTransaction.transaction_id + 1 : 101;
    
    const transaction = new Transaction({
      transaction_id: newTransactionId,
      ...req.body
    });
    
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET total revenue
router.get('/revenue/total', async (req, res) => {
  try {
    const totalRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'Success',
          type: { $in: ['Booking', 'Coaching'] }
        }
      },
      {
        $group: {
          _id: null,
          total_revenue: { $sum: '$amount' },
          transaction_count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      total_revenue: totalRevenue[0]?.total_revenue || 0,
      transaction_count: totalRevenue[0]?.transaction_count || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;