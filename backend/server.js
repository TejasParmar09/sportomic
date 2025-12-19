const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const rateLimit = require('express-rate-limit'); // Disabled - uncomment if needed
const mongoose = require('mongoose');
const connectDB = require('./config/db');
require('dotenv').config();

// Import models
const Member = require('./models/Member');
const Booking = require('./models/Booking');
const Transaction = require('./models/Transaction');
const Venue = require('./models/Venue');

// Import routes
const venueRoutes = require('./routes/venueRoutes');
const memberRoutes = require('./routes/memberRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for dashboard
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// Rate limiting disabled for development
// Uncomment and configure if needed for production
// if (process.env.NODE_ENV === 'production') {
//     const limiter = rateLimit({
//         windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
//         max: parseInt(process.env.API_RATE_LIMIT_MAX) || 100,
//         message: 'Too many requests from this IP, please try again later.',
//         standardHeaders: true,
//         legacyHeaders: false,
//     });
//     app.use('/api', limiter);
// }

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/venues', venueRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const { venue_id, sport_id, month, year } = req.query;

        // Build date filter
        let dateFilter = {};
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            dateFilter = { transaction_date: { $gte: startDate, $lte: endDate } };
        }

        // Build booking filter
        let bookingFilter = {};
        if (venue_id && venue_id !== '') {
            bookingFilter.venue_id = parseInt(venue_id);
        }
        if (sport_id && sport_id !== '') {
            bookingFilter.sport_id = parseInt(sport_id);
        }

        // Get member stats
        const activeMembers = await Member.countDocuments({ status: 'Active' });
        const inactiveMembers = await Member.countDocuments({ status: 'Inactive' });
        const trialMembers = await Member.countDocuments({ is_trial_user: true });
        const convertedMembers = await Member.countDocuments({ converted_from_trial: true });
        const conversionRate = trialMembers > 0 ? ((convertedMembers / trialMembers) * 100).toFixed(2) : '0.00';

        // Get booking stats
        const totalBookings = await Booking.countDocuments(bookingFilter);
        const confirmedBookings = await Booking.countDocuments({ ...bookingFilter, status: 'Confirmed' });

        // Get transaction stats with filters
        let transactionMatch = { status: 'Success', ...dateFilter };
        const hasBookingFilter = Object.keys(bookingFilter).length > 0;
        if (hasBookingFilter) {
            const bookingIds = await Booking.find(bookingFilter).distinct('booking_id');
            if (bookingIds.length > 0) {
                transactionMatch.booking_id = { $in: bookingIds };
            } else {
                // No bookings match the filter, return empty results
                transactionMatch.booking_id = { $in: [] };
            }
        }

        // Coaching revenue
        const coachingRevenue = await Transaction.aggregate([
            { $match: { ...transactionMatch, type: 'Coaching' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Booking revenue
        const bookingRevenue = await Transaction.aggregate([
            { $match: { ...transactionMatch, type: 'Booking' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Total revenue
        const totalRevenue = await Transaction.aggregate([
            { $match: { ...transactionMatch, type: { $in: ['Booking', 'Coaching'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Refunds & disputes
        const refundsDisputes = await Transaction.countDocuments({
            status: { $in: ['Refunded', 'Dispute'] },
            ...dateFilter
        });

        // Coupon redemption count
        const couponRedemption = await Booking.countDocuments({
            ...bookingFilter,
            coupon_code: { $ne: '', $exists: true }
        });

        // Repeat booking rate (members with more than 1 booking)
        const membersWithBookings = await Booking.distinct('member_id', bookingFilter);
        const repeatBookingMembers = await Booking.aggregate([
            { $match: bookingFilter },
            { $group: { _id: '$member_id', count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } },
            { $count: 'repeat_members' }
        ]);
        const repeatBookingRate = membersWithBookings.length > 0
            ? (((repeatBookingMembers[0]?.repeat_members || 0) / membersWithBookings.length) * 100).toFixed(2)
            : '0.00';

        // Slots utilization (simplified - would need slot data for accurate calculation)
        const slotsUtilization = '0.00';

        res.json({
            active_members: activeMembers,
            inactive_members: inactiveMembers,
            trial_conversion_rate: parseFloat(conversionRate),
            coaching_revenue: (coachingRevenue[0]?.total || 0).toFixed(2),
            bookings: totalBookings,
            booking_revenue: (bookingRevenue[0]?.total || 0).toFixed(2),
            slots_utilization: parseFloat(slotsUtilization),
            coupon_redemption: couponRedemption,
            repeat_booking: parseFloat(repeatBookingRate),
            total_revenue: (totalRevenue[0]?.total || 0).toFixed(2),
            refunds_disputes: refundsDisputes
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Revenue chart endpoint (time-series data)
app.get('/api/dashboard/revenue-chart', async (req, res) => {
    try {
        const { venue_id, sport_id, days = 30 } = req.query;

        // Build booking filter
        let bookingFilter = {};
        if (venue_id && venue_id !== '') {
            bookingFilter.venue_id = parseInt(venue_id);
        }
        if (sport_id && sport_id !== '') {
            bookingFilter.sport_id = parseInt(sport_id);
        }

        // Date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get booking IDs if filtered
        let transactionMatch = {
            status: 'Success',
            type: { $in: ['Booking', 'Coaching'] },
            transaction_date: { $gte: startDate, $lte: endDate }
        };

        const hasBookingFilter = Object.keys(bookingFilter).length > 0;
        if (hasBookingFilter) {
            const bookingIds = await Booking.find(bookingFilter).distinct('booking_id');
            if (bookingIds.length > 0) {
                transactionMatch.booking_id = { $in: bookingIds };
            } else {
                // No bookings match the filter, return empty results
                transactionMatch.booking_id = { $in: [] };
            }
        }

        // Aggregate revenue by date
        const revenueData = await Transaction.aggregate([
            { $match: transactionMatch },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$transaction_date' }
                    },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Create a map of dates with revenue
        const revenueMap = {};
        revenueData.forEach(item => {
            revenueMap[item._id] = item.revenue;
        });

        // Generate all dates in the range
        const chartData = [];
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            chartData.push({
                date: dateStr,
                revenue: revenueMap[dateStr] || 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.json(chartData);
    } catch (error) {
        console.error('Revenue chart error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get venues for filter dropdown
app.get('/api/dashboard/venues', async (req, res) => {
    try {
        const venues = await Venue.find().sort({ venue_id: 1 });
        // Format venues for FilterDropdown compatibility
        const formattedVenues = venues.map(venue => ({
            ...venue.toObject(),
            id: venue.venue_id, // Add id property for FilterDropdown
            value: venue.venue_id, // Add value property for FilterDropdown
            label: venue.name // Add label property for FilterDropdown
        }));
        res.json(formattedVenues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get sports for filter dropdown (distinct sport_ids from bookings)
app.get('/api/dashboard/sports', async (req, res) => {
    try {
        const sports = await Booking.distinct('sport_id');
        const sportsList = sports.map(id => ({
            id: id,
            value: id, // Add value property for FilterDropdown compatibility
            name: `Sport ${id}`, // You can map this to actual sport names if you have a sports model
            label: `Sport ${id}` // Add label for FilterDropdown compatibility
        }));
        res.json(sportsList.sort((a, b) => a.id - b.id));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});