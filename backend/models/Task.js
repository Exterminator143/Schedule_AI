const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true, // e.g., "9:00 AM" or Date string
  },
  keyword: {
    type: String,
    required: false, // Core topic for research
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none',
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  researchSummary: {
    type: String,
    default: '',
  },
  researchLinks: [{
    title: String,
    url: String,
  }],
  fcmToken: {
    type: String, // Store client device token for push notifications
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
