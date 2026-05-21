const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');

// GET /api/channels - list all channels
router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: 1 });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/channels - create a channel
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Channel name is required' });

    const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!cleanName) return res.status(400).json({ message: 'Invalid channel name' });

    const existing = await Channel.findOne({ name: cleanName });
    if (existing) return res.status(409).json({ message: 'Channel already exists' });

    const channel = new Channel({
      name: cleanName,
      description: description || '',
      createdBy: req.user.id,
    });
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    console.error('Create channel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/channels/:id - delete a channel (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    if (channel.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await channel.deleteOne();
    res.json({ message: 'Channel deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
