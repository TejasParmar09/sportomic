const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');

// GET all venues
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find().sort('venue_id');
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET venue by ID
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findOne({ venue_id: req.params.id });
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new venue
router.post('/', async (req, res) => {
  try {
    const lastVenue = await Venue.findOne().sort('-venue_id');
    const newVenueId = lastVenue ? lastVenue.venue_id + 1 : 1;
    
    const venue = new Venue({
      venue_id: newVenueId,
      ...req.body
    });
    
    const savedVenue = await venue.save();
    res.status(201).json(savedVenue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update venue
router.put('/:id', async (req, res) => {
  try {
    const venue = await Venue.findOneAndUpdate(
      { venue_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.json(venue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE venue
router.delete('/:id', async (req, res) => {
  try {
    const venue = await Venue.findOneAndDelete({ venue_id: req.params.id });
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;