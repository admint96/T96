const UserAuth = require('../Models/UserAuth');
const express = require('express');
const router = express.Router();

const RecruiterProfile = require('../Models/RecruiterProfile');
const JobSeekerProfile = require('../Models/JobSeekerProfile');

// GET: Summary counts
router.get('/summary', async (req, res) => {
  try {
    const [recruiters, jobSeekers, recruiterDocs] = await Promise.all([
      RecruiterProfile.countDocuments(),
      JobSeekerProfile.countDocuments(),
      RecruiterProfile.find()
    ]);

    let jobPosts = 0;
    let totalApplications = 0;
    let activeRecruiters = 0;
    let latestJob = null;

    recruiterDocs.forEach(recruiter => {
      const posts = recruiter.jobPosts || [];
      if (posts.length > 0) activeRecruiters++;
      jobPosts += posts.length;
      totalApplications += posts.reduce((sum, post) => sum + (post.applicants?.length || 0), 0);

      posts.forEach(post => {
        if (!latestJob || new Date(post.postedAt) > new Date(latestJob.postedAt)) {
          latestJob = {
            jobTitle: post.jobTitle,
            postedAt: post.postedAt,
            recruiter: recruiter.fullName
          };
        }
      });
    });

    res.status(200).json({
      recruiters,
      jobSeekers,
      jobPosts,
      totalApplications,
      activeRecruiters,
      latestJob,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Failed to fetch summary data' });
  }
});



// GET: Recent users as activity logs
router.get('/', async (req, res) => {
  try {
    const users = await UserAuth.find()
      .sort({ createdAt: -1 }) // recent first
      .limit(50); // adjust limit as needed
    console.log("USWR  ",users);
    const logs = users.map(user => ({
      _id: user._id,
      role: user.role,
      userName: user.name || user.email,
      action: 'Registered',
      details: null,
      timestamp: user.createdAt,
    }));

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
});


module.exports = router;