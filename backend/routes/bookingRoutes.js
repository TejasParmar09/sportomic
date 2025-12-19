const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Member = require('../models/Member');

// Test endpoint to check if Booking model works
router.get('/test', async (req, res) => {
    try {
        const count = await Booking.countDocuments();
        res.json({ success: true, count, message: 'Booking model is working' });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// GET all bookings with filters
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/bookings called');
        console.log('Query params:', req.query);

        const { status, venue_id, member_id, sport_id, start_date, end_date } = req.query;
        let filter = {};

        // Handle status filter
        if (status && status.trim() !== '') {
            filter.status = status;
        }

        // Handle numeric filters with proper validation
        if (venue_id && venue_id !== '' && venue_id !== 'undefined') {
            const parsedVenueId = parseInt(venue_id, 10);
            if (!isNaN(parsedVenueId)) {
                filter.venue_id = parsedVenueId;
            }
        }

        if (member_id && member_id !== '' && member_id !== 'undefined') {
            const parsedMemberId = parseInt(member_id, 10);
            if (!isNaN(parsedMemberId)) {
                filter.member_id = parsedMemberId;
            }
        }

        if (sport_id && sport_id !== '' && sport_id !== 'undefined') {
            const parsedSportId = parseInt(sport_id, 10);
            if (!isNaN(parsedSportId)) {
                filter.sport_id = parsedSportId;
            }
        }

        // Handle date filters
        if (start_date || end_date) {
            filter.booking_date = {};
            if (start_date) {
                const start = new Date(start_date);
                if (!isNaN(start.getTime())) {
                    filter.booking_date.$gte = start;
                }
            }
            if (end_date) {
                const end = new Date(end_date);
                if (!isNaN(end.getTime())) {
                    filter.booking_date.$lte = end;
                }
            }
            // If date filter object is empty, remove it
            if (Object.keys(filter.booking_date).length === 0) {
                delete filter.booking_date;
            }
        }

        console.log('Filter object:', filter);

        // Find bookings
        const bookings = await Booking.find(filter).sort({ booking_date: -1 });
        console.log(`Found ${bookings.length} bookings`);

        // Convert mongoose documents to plain objects
        const bookingsData = bookings.map(booking => {
            const obj = booking.toObject ? booking.toObject() : booking;
            return obj;
        });

        res.json(bookingsData || []);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            message: error.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// GET booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: parseInt(req.params.id) }).lean();

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// POST create new booking with validation
router.post('/', async (req, res) => {
    try {
        const { venue_id, member_id, booking_date, amount } = req.body;

        // Check if venue exists
        const venue = await Venue.findOne({ venue_id });
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }

        // Check if member exists and is active
        const member = await Member.findOne({ member_id });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        if (member.status !== 'Active') {
            return res.status(400).json({ message: 'Member is not active' });
        }

        // Check for double booking (same venue at same time)
        const existingBooking = await Booking.findOne({
            venue_id,
            booking_date: new Date(booking_date),
            status: { $in: ['Confirmed', 'Completed'] }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Venue is already booked at this time' });
        }

        // Calculate final amount with coupon discount
        let finalAmount = amount;
        const { coupon_code } = req.body;

        if (coupon_code) {
            const couponDiscounts = {
                'EARLYBIRD': 0.1,  // 10% discount
                'WELCOME50': 0.5,  // 50% discount
                'SAVE10': 0.1      // 10% discount
            };

            if (couponDiscounts[coupon_code]) {
                finalAmount = amount * (1 - couponDiscounts[coupon_code]);
            }
        }

        // Generate new booking ID
        const lastBooking = await Booking.findOne().sort('-booking_id');
        const newBookingId = lastBooking ? lastBooking.booking_id + 1 : 1;

        const booking = new Booking({
            booking_id: newBookingId,
            ...req.body,
            amount: finalAmount,
            status: 'Confirmed'
        });

        const savedBooking = await booking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update booking status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Confirmed', 'Completed', 'Cancelled', 'Pending'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findOneAndUpdate(
            { booking_id: req.params.id },
            { status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET revenue by venue
router.get('/revenue/venue', async (req, res) => {
    try {
        const revenueByVenue = await Booking.aggregate([
            {
                $match: {
                    status: { $in: ['Confirmed', 'Completed'] }
                }
            },
            {
                $group: {
                    _id: '$venue_id',
                    total_revenue: { $sum: '$amount' },
                    booking_count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'venues',
                    localField: '_id',
                    foreignField: 'venue_id',
                    as: 'venue_details'
                }
            },
            {
                $unwind: '$venue_details'
            },
            {
                $project: {
                    venue_id: '$_id',
                    venue_name: '$venue_details.name',
                    location: '$venue_details.location',
                    total_revenue: 1,
                    booking_count: 1,
                    _id: 0
                }
            },
            {
                $sort: { total_revenue: -1 }
            }
        ]);

        res.json(revenueByVenue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;