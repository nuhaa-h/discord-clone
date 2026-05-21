const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
