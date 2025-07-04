const express = require('express');
const Notification = require('../Models/Notification');
const RecruiterProfile = require('../Models/RecruiterProfile');
const verifyToken = require('../Middleware/Auth');

module.exports = function (io) {
  const router = express.Router();

  // GET all notifications for a user
  router.get('/:userId', async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.params.userId })
        .sort({ createdAt: -1 });

      res.status(200).json(notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  });

  
  router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { type, title, message, jobId, metadata = {}, companyName, companyLogo } = req.body;
    console.log('data',req.body);

    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields (type, title, message)' });
    }

    try {
      let finalCompanyName = companyName || '';
      let finalCompanyLogo = companyLogo || '';

      
      if (!finalCompanyName || !finalCompanyLogo) {
        const recruiter = await RecruiterProfile.findOne({ userId });
        if (recruiter) {
          finalCompanyName = recruiter.companyName || finalCompanyName;
          finalCompanyLogo = recruiter.companyLogo || finalCompanyLogo;
        }
      }

      const newNotification = new Notification({
        userId,
        type,
        title,
        message,
        jobId,
        metadata,
        companyName: finalCompanyName,
        companyLogo: finalCompanyLogo,
      });

      await newNotification.save();

      
      if (io?.to) {
        io.to(userId).emit('new_notification', newNotification);
      }

      res.status(201).json(newNotification);
    } catch (err) {
      console.error(' Error creating notification:', err);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  
  router.put('/:id/read', async (req, res) => {
    try {
      const updated = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.status(200).json(updated);
    } catch (err) {
      console.error(' Error marking as read:', err);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  
 router.put('/:userId/read-all', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const result = await Notification.updateMany(
      { userId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read', result });
  } catch (err) {
    console.error(' Error marking all as read:', err);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

  
  router.delete('/:id', async (req, res) => {
    try {
      const deleted = await Notification.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.status(200).json({ message: 'Notification deleted' });
    } catch (err) {
      console.error(' Error deleting notification:', err);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  
  router.delete('/all', verifyToken, async (req, res) => {
    try {
      const result = await Notification.deleteMany({ userId: req.user.id });
      res.status(200).json({ message: 'All notifications deleted', result });
    } catch (err) {
      console.error(' Error deleting all notifications:', err);
      res.status(500).json({ error: 'Failed to delete notifications' });
    }
  });

  return router;
};
