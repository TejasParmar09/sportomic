const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// GET all members
router.get('/', async (req, res) => {
  try {
    const { status, is_trial } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (is_trial !== undefined) filter.is_trial_user = is_trial === 'true';
    
    const members = await Member.find(filter).sort('member_id');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET member by ID
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findOne({ member_id: req.params.id });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new member
router.post('/', async (req, res) => {
  try {
    const lastMember = await Member.findOne().sort('-member_id');
    const newMemberId = lastMember ? lastMember.member_id + 1 : 1;
    
    const member = new Member({
      member_id: newMemberId,
      ...req.body
    });
    
    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update member status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const member = await Member.findOneAndUpdate(
      { member_id: req.params.id },
      { status },
      { new: true }
    );
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;