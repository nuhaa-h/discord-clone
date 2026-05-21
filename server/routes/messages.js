const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/messages/:channelId - fetch messages for a channel
router.get('/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const messages = await Message.find({ channel: channelId })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse());
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/messages/:id - delete a message (author only)
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (message.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
