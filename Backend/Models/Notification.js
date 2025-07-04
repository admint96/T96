const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['job_alert', 'application_status', 'recruiter_message', 'system'],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  metadata: {
    type: Object,
  },
  companyName: {
    type: String, // e.g., 'TCS', 'Infosys'
  },
  companyLogo: {
    type: String, // URL to the company logo
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);
