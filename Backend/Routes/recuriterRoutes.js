const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/Auth');
const RecruiterProfile = require('../Models/RecruiterProfile');
const mongoose = require('mongoose');
const UserAuth = require('../Models/UserAuth');
const JobSeekerProfile = require('../Models/JobSeekerProfile');
const Notification = require('../Models/Notification');

router.get('/profile', verifyToken, async (req, res) => {
  console.log('Request for recruiter profile by user:', req.user.id);

  try {
    
    const recruiter = await RecruiterProfile.findOne({ userId: req.user.id }).select(
      'fullName profileImage companyName designation companyWebsite'
    );

    const user = await UserAuth.findById(req.user.id).select('email');

    if (!recruiter || !user) {
      return res.status(404).json({ message: 'Recruiter or User not found' });
    }

    const responseData = {
      ...recruiter._doc,
      email: user.email,
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error fetching recruiter profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



router.put('/update-data', verifyToken, async (req, res) => {
  console.log("request");
  try {
    const userId = req.user.id;

    const updatedData = {
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      companyName: req.body.companyName,
      companyWebsite: req.body.companyWebsite,
      profileImage: req.body.profileImage,
    };

    const profile = await RecruiterProfile.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Failed to update recruiter profile' });
  }
});


router.post('/create', verifyToken, async (req, res) => {
  console.log('request job post');
  try {
    const userId = req.user.id;

    const {
      jobTitle,
      companyName,
      companyLogo,
      salary,
      experience,
      location,
      description,
      jobType,
      remote,
      skills,
      recruiterEmail,
      openings,
    } = req.body;

    const recruiter = await RecruiterProfile.findOne({ userId });

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }

    const newJob = {
      jobTitle,
      companyName,
      companyLogo,
      salary,
      experience,
      location,
      description,
      jobType,
      remote,
      skills,
      recruiterEmail,
      openings,
      applicants: [],
    };

    recruiter.jobPosts.push(newJob);

    await recruiter.save();

    return res.status(201).json({ message: 'Job posted successfully' });
  } catch (error) {
    console.error('Job creation error:', error);
    return res.status(500).json({ message: 'Failed to post job', error: error.message });
  }
});


router.put('/update-post', verifyToken, async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { oldTitle, ...updatedJob } = req.body;

    if (!oldTitle) {
      return res.status(400).json({ message: 'Old job title is required' });
    }

    const recruiter = await RecruiterProfile.findOne({ userId: recruiterId });

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }

    const jobIndex = recruiter.jobPosts.findIndex(job => job.jobTitle === oldTitle);

    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found with the given title' });
    }

    recruiter.jobPosts[jobIndex] = {
      ...recruiter.jobPosts[jobIndex]._doc,
      ...updatedJob,
      postedAt: new Date()
    };

    await recruiter.save();

    res.status(200).json({ message: 'Job updated successfully', job: recruiter.jobPosts[jobIndex] });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
});



router.get('/all-with-openings', verifyToken, async (req, res) => {
  try {
    const recruiters = await RecruiterProfile.find();

    const updatedRecruiters = recruiters.map(rec => {
      let totalOpenings = 0;

      if (Array.isArray(rec.jobPosts)) {
        for (const job of rec.jobPosts) {
          const openings = Number(job.openings) || 0; 
          totalOpenings += openings;
        }
      }
      return {
        ...rec.toObject(),
        totalOpenings
      };
    });

    const grandTotalOpenings = updatedRecruiters.reduce(
      (sum, rec) => sum + (rec.totalOpenings || 0),
      0
    );

    
    res.status(200).json({
      recruiters: updatedRecruiters,
      grandTotalOpenings
    });

  } catch (error) {
    console.error('Error fetching recruiter data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.get('/my-jobs', verifyToken, async (req, res) => {
  console.log('request jobs');
  console.log(req.user.id)
  try {
    const recruiter = await RecruiterProfile.findOne({ userId: req.user.id });

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.status(200).json({ jobs: recruiter.jobPosts });
  } catch (error) {
    console.error('Error fetching job posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/:jobId', verifyToken, async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  try {
    const recruiter = await RecruiterProfile.findOne({ userId });
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    const jobIndex = recruiter.jobPosts.findIndex(job => job._id.toString() === jobId);
    if (jobIndex === -1) return res.status(404).json({ message: 'Job not found' });

    recruiter.jobPosts.splice(jobIndex, 1); 
    await recruiter.save();

    res.status(200).json({ message: 'Job post deleted successfully' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:jobId', verifyToken, async (req, res) => {
  const { jobId } = req.params;
  const updates = req.body;
  const userId = req.user.id;

  try {
    const recruiter = await RecruiterProfile.findOne({ userId });
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    const job = recruiter.jobPosts.id(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    Object.keys(updates).forEach(key => {
      if (key in job) job[key] = updates[key];
    });

    await recruiter.save();
    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/count', verifyToken, async (req, res) => {
  console.log('request for count');
  try {
    const recruiters = await RecruiterProfile.find({}, 'jobPosts');
    let totalJobs = 0;

    recruiters.forEach(recruiter => {
      totalJobs += recruiter.jobPosts.length;
    });

    res.json({ total: totalJobs });
  } catch (error) {
    console.error('Error fetching total job count:', error.message);
    res.status(500).json({ error: 'Failed to fetch total job count' });
  }
});


router.get('/applied/count', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const result = await RecruiterProfile.aggregate([
      { $unwind: '$jobPosts' },
      { $unwind: '$jobPosts.applicants' },
      {
        $match: {
          'jobPosts.applicants.userId': new mongoose.Types.ObjectId(currentUserId),
        },
      },
      {
        $count: 'count',
      },
    ]);

    const count = result.length > 0 ? result[0].count : 0;
    res.json({ count });
  } catch (err) {
    console.error('Error counting applications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/latest', verifyToken, async (req, res) => {
  try {
    console.log("Requested /latest by:", req.user);

    const latestJobs = await RecruiterProfile.aggregate([
      { $unwind: "$jobPosts" }, 
      { $sort: { "jobPosts.postedAt": -1 } }, 
      { $limit: 10 },
      {
        $project: {
          _id: "$jobPosts._id",
          jobTitle: "$jobPosts.jobTitle",
          companyName: "$jobPosts.companyName",
          companyLogo: "$jobPosts.companyLogo",
          salary: "$jobPosts.salary",
          experience: "$jobPosts.experience",
          location: "$jobPosts.location",
          description: "$jobPosts.description",
          jobType: "$jobPosts.jobType",
          remote: "$jobPosts.remote",
          Skills: "$jobPosts.skills",
          openings: "$jobPosts.openings",
          postedAt: "$jobPosts.postedAt",
        }
      }
    ]);

    res.json(latestJobs);
  } catch (error) {
    console.error('Error fetching latest jobs:', error.message);
    res.status(500).json({ error: 'Failed to fetch latest jobs' });
  }
});


router.post('/recommended', verifyToken, async (req, res) => {
  console.log('🔍 Recommending jobs...');

  try {
    const { designation, skills, location } = req.body;
    console.log('📥 Request body:', req.body);

    const normalize = (str) =>
      typeof str === 'string' ? str.trim().toLowerCase() : '';

    const userDesignation = normalize(designation);
    const userLocation = normalize(location);
    const userSkills = (skills || []).map((s) =>
      normalize(typeof s === 'string' ? s : s?.name)
    );

    const hasInput =
      !!userDesignation || !!userLocation || userSkills.length > 0;

    const allRecruiters = await RecruiterProfile.find();
    let matchedJobs = [];
    let fresherJobs = [];

    allRecruiters.forEach((recruiter) => {
      recruiter.jobPosts.forEach((job) => {
        const jobTitle = normalize(job.jobTitle);
        const jobLocation = normalize(job.location);
        const jobSkills = (job.skills || []).map(normalize);
        const jobExperience = normalize(job.experience);

        const matchesDesignation =
          userDesignation && jobTitle.includes(userDesignation);
        const matchesLocation =
          userLocation && jobLocation.includes(userLocation);
        const matchesSkills = userSkills.some((skill) =>
          jobSkills.includes(skill)
        );

        const isFresherJob =
          jobExperience === 'fresher' || jobTitle.includes('fresher');

       
        if (matchesDesignation || matchesLocation || matchesSkills) {
          matchedJobs.push(job);
        }

       
        if (isFresherJob) {
          fresherJobs.push(job);
        }
      });
    });

    let recommendedJobs = [];

    if (hasInput && matchedJobs.length > 0) {
      recommendedJobs = matchedJobs.slice(0, 10);
      console.log(`${recommendedJobs.length} job(s) matched user input.`);
    } else {
      recommendedJobs = fresherJobs.slice(0, 10);
      console.log(
        `⚠️ No input matches found. Returning ${recommendedJobs.length} fresher job(s).`
      );
    }

    res.json(recommendedJobs);
  } catch (error) {
    console.error('Error fetching recommended jobs:', error.message);
    res.status(500).json({ error: 'Failed to fetch recommended jobs' });
  }
});



router.post('/:jobId/apply', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId, name, email, resume, address, profileImage } = req.body;
    console.log('Apply request:', req.body);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }

    if (!name || !email || !resume || !address || !profileImage) {
      return res.status(400).json({ message: 'Update your profile' });
    }

    const recruiter = await RecruiterProfile.findOne({ 'jobPosts._id': jobId });
    if (!recruiter) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = recruiter.jobPosts.id(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found in jobPosts' });
    }

    const alreadyApplied = job.applicants.some(
      app => app.userId?.toString() === userId
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied' });
    }

    job.applicants.push({
      userId: new mongoose.Types.ObjectId(userId),
      name,
      email,
      resume,
      address,
      profileImage,
    });

    await recruiter.save();

    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Apply error:', err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/:jobId/is-applied', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    
    console.log(jobId);
    console.log(userId);
    const recruiter = await RecruiterProfile.findOne({ 'jobPosts._id': jobId });
    if (!recruiter) return res.status(404).json({ message: 'Job not found' });

    const job = recruiter.jobPosts.id(jobId);
    if (!job) return res.status(404).json({ message: 'Job post not found' });

    const alreadyApplied = job.applicants.some(
      app => app.userId?.toString() === userId
    );

    res.json({ applied: alreadyApplied });
  } catch (err) {
    console.error('Error checking application:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/applied-jobs', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    
    const recruiters = await RecruiterProfile.find({}, 'jobPosts');

    const appliedJobs = [];

    recruiters.forEach(recruiter => {
      recruiter.jobPosts.forEach(job => {
        const hasApplied = job.applicants.some(app => app.userId?.toString() === userId);
        if (hasApplied) {
          appliedJobs.push({
            ...job.toObject(),

           
            companyName: job.companyName || 'Company not provided',
            companyLogo: job.companyLogo || 'https://placehold.co/48x48',
          });
        }
      });
    });

    res.json(appliedJobs);
  } catch (error) {
    console.error('Error fetching applied jobs:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});





router.post('/save-job', verifyToken, async (req, res) => {
  const { jobId } = req.body;
  console.log('Save job request:', req.body);
  console.log('Authenticated User ID:', req.user.id);
  try {

    await JobSeekerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $addToSet: { savedJobs: jobId } },
      { new: true }
    );
    res.json({ message: 'Job saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/unsave-job/:jobId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; 
    const jobId = req.params.jobId;

    console.log('Unsave job request for jobId:', jobId);
    console.log('Authenticated User ID:', userId);

    const updatedProfile = await JobSeekerProfile.findOneAndUpdate(
      { userId },
      { $pull: { savedJobs: jobId } },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: 'User not found or job not saved.' });
    }

    res.json({ message: 'Job unsaved successfully', updatedSavedJobs: updatedProfile.savedJobs });
  } catch (err) {
    console.error('Error unsaving job:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});





router.get('/saved-jobs', verifyToken, async (req, res) => {
  try {
    
    const profile = await JobSeekerProfile.findOne({ userId: req.user._id });
    res.json(profile.savedJobs || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post('/saved-jobs/details', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('Request for saved job details of user:', userId);

   
    const jobSeeker = await JobSeekerProfile.findOne({ userId });

    if (!jobSeeker || !Array.isArray(jobSeeker.savedJobs) || jobSeeker.savedJobs.length === 0) {
      return res.json([]); 
    }

    const savedJobIds = jobSeeker.savedJobs;

   
    const recruiters = await RecruiterProfile.find({
      'jobPosts._id': { $in: savedJobIds },
    });

    const savedJobs = [];

   
    recruiters.forEach((recruiter) => {
      recruiter.jobPosts.forEach((job) => {
        if (savedJobIds.some((id) => job._id.equals(id))) {
          savedJobs.push({
            _id: job._id,
            jobTitle: job.jobTitle,
            companyName: job.companyName,
            companyLogo: job.companyLogo,
            salary: job.salary,
            experience: job.experience,
            location: job.location,
            description: job.description,
            jobType: job.jobType,
            remote: job.remote,
            skills: job.skills,
            openings: job.openings,
            postedAt: job.postedAt,
          });
        }
      });
    });

    res.json(savedJobs);
  } catch (err) {
    console.error('Error retrieving saved job details:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});




router.get('/job-applicants/:jobId', verifyToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const recruiterUserId = req.user.id;

    
    console.log('Recruiter userId from token:', recruiterUserId);

    
    const recruiter = await RecruiterProfile.findOne({ userId: new mongoose.Types.ObjectId(recruiterUserId) });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    
    const job = recruiter.jobPosts.find(j => j._id.toString() === jobId);
    console.log('Job found:', job); // Debugging line
    if (!job) {
      return res.status(404).json({ message: 'Job not found in recruiter profile' });
    }

    
    return res.status(200).json({ applicants: job.applicants });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





router.get('/applicant/:applicantId', verifyToken, async (req, res) => {
  try {
    const { applicantId } = req.params;

    console.log('Fetching details for applicant with userId:', applicantId);

    const profile = await JobSeekerProfile.findOne({ userId: applicantId }).select('-password');

    if (!profile) {
      return res.status(404).json({ message: 'Applicant profile not found' });
    }

    const auth = await UserAuth.findOne({ _id: applicantId }).select('email');

    if (!auth) {
      return res.status(404).json({ message: 'Applicant auth record not found' });
    }

    const applicant = {
      ...profile._doc,
      email: auth.email,
    };

    res.status(200).json({ applicant });
  } catch (error) {
    console.error('Error fetching applicant details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




router.post('/search-jobs', async (req, res) => {
  try {
    const { designation = [], location = '', type = '' } = req.body;

    console.log('🔍 Search criteria:', { designation, location, type });

    const normalize = (str) =>
      typeof str === 'string' ? str.trim().toLowerCase() : '';

    
    const searchRegexes =
      designation.length > 0
        ? designation.map((term) => new RegExp(term, 'i'))
        : [];

    const locationRegex = location ? new RegExp(location, 'i') : null;

    const jobTypeFilter = (jobType) => {
      const lowerType = type.toLowerCase();

      if (lowerType === 'job') {
        return ['full-time', 'part-time', 'contract'].includes(
          jobType.toLowerCase()
        );
      } else if (lowerType === 'internship') {
        return jobType.toLowerCase() === 'internship';
      } else {
        return true;
      }
    };

    const recruiters = await RecruiterProfile.find({}, 'jobPosts');

    let matchingJobs = recruiters.flatMap((recruiter) =>
      recruiter.jobPosts.filter((job) => {
        const jobTitle = normalize(job.jobTitle);
        const jobSkills = (job.skills || []).map(normalize);
        const jobDescription = normalize(job.description || '');
        const jobLocation = normalize(job.location || '');
        const jobType = job.jobType;

       
        const designationMatch =
          searchRegexes.length > 0 &&
          searchRegexes.every(
            (regex) =>
              regex.test(jobTitle) ||
              jobSkills.some((skill) => regex.test(skill)) ||
              regex.test(jobDescription)
          );

        const locationMatch = locationRegex
          ? locationRegex.test(jobLocation)
          : true;

        const typeMatch = jobTypeFilter(jobType);

        return designationMatch && locationMatch && typeMatch;
      })
    );

    const formattedJobs = matchingJobs.map((job) => ({
      _id: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      salary: job.salary,
      experience: job.experience,
      location: job.location,
      description: job.description,
      jobType: job.jobType,
      remote: job.remote,
      skills: job.skills,
      postedAt: job.postedAt,
    }));

    formattedJobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

    res.status(200).json(formattedJobs);
  } catch (err) {
    console.error(' Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET /api/recruiters/jobs

router.get('/jobs', async (req, res) => {
  try {
    const { search, location, experience, jobType, salary, company } = req.query;

   
    const recruiters = await RecruiterProfile.find({}, 'jobPosts companyName').lean();

   
    let jobs = recruiters.flatMap((recruiter) =>
      recruiter.jobPosts.map((job) => ({
        ...job,
        companyName: recruiter.companyName?.trim() || job.companyName || 'Company not provided',
      }))
    );

    
    if (search) {
      const regex = new RegExp(search, 'i');
      jobs = jobs.filter(
        (job) => regex.test(job.jobTitle) || regex.test(job.companyName)
      );
    }

    if (location) jobs = jobs.filter((job) => job.location === location);
    if (experience) jobs = jobs.filter((job) => job.experience === experience);
    if (jobType) jobs = jobs.filter((job) => job.jobType === jobType);
    if (salary) jobs = jobs.filter((job) => job.salary === salary);
    if (company) jobs = jobs.filter((job) => job.companyName === company);

    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.patch('/applicant-status', verifyToken, async (req, res) => {
  try {
    const { jobId, applicantId, status } = req.body;
    console.log('Update status request:', req.body);
     
    const recruiter = await RecruiterProfile.findOne({ userId: req.user.id });
    console.log('Recruiter found:', recruiter ? recruiter.id : 'Not found');
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    const job = recruiter.jobPosts.id(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applicant = job.applicants.find(app => app.userId.toString() === applicantId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    applicant.applicationStatus = status;

    
    recruiter.markModified('jobPosts');

    await recruiter.save();

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Example: in routes/auth.js
router.get('/check-email-verified/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Checking email verification for userId:', userId);

    const profile = await RecruiterProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: 'Recruiter not found', verified: false });
    }

    return res.status(200).json({ verified: profile.emailVerified });
  } catch (err) {
    console.error('Email verification check failed:', err);
    return res.status(500).json({ message: 'Server error', verified: false });
  }
});



router.put('/:jobId/applicants/:applicantId/status', verifyToken, async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const { status, companyName: bodyCompanyName, companyLogo: bodyCompanyLogo } = req.body;

    
    const validStatuses = ['shortlist', 'maybe', 'reject'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "shortlist", "maybe", or "reject".' });
    }

    
    const recruiter = await RecruiterProfile.findOne({ userId: req.user.id });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    
    const job = recruiter.jobPosts.id(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    
    const applicant = job.applicants.find(app => app.userId.toString() === applicantId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found for this job' });
    }

    
    applicant.applicationStatus = status;
    recruiter.markModified('jobPosts');
    await recruiter.save();

    
    const companyName = bodyCompanyName || recruiter.companyName || 'Our Company';
    const companyLogo = bodyCompanyLogo || recruiter.companyLogo || null;

    
    const notification = new Notification({
      userId: applicant.userId,
      type: 'application_status',
      title: 'Application Status Updated',
      message: `You have been ${status} for the position: ${job.jobTitle}`,
      jobId: job._id,
      metadata: {
        status,
        companyName,
        companyLogo,
      },
      createdAt: new Date(),
    });
    await notification.save();

    
    const io = req.app.get('io');
    if (io) {
      io.to(applicant.userId.toString()).emit('new_notification', notification);
    }

    res.status(200).json({
      message: `Applicant ${status} successfully`,
      updatedApplicant: applicant,
    });
  } catch (err) {
    console.error('Error updating applicant status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/summary', verifyToken, async (req, res) => {
  try {
    const recruiters = await RecruiterProfile.find()
      .populate('userId', 'name email') // Populate recruiter name & email
      .lean(); // Use lean to improve performance

    const result = recruiters.flatMap(r => {
      return (r.jobPosts || []).map(post => ({
        // From UserAuth
        recruiterName: r.userId?.name || r.fullName || 'Unknown',
        email: r.userId?.email || 'N/A',

        // From RecruiterProfile
        profileImage: r.profileImage,
        companyName: post.companyName || r.companyName || 'N/A',
        companyWebsite: r.companyWebsite || 'N/A',
        emailVerified: r.emailVerified,
        status: r.emailVerified ? 'Verified' : 'Pending',

        // From each JobPost
        jobTitle: post.jobTitle || 'No Job Title',
        applicantCount: post.applicants?.length || 0,
        jobType: post.jobType || 'N/A',
        location: post.location || 'N/A',
        salary: post.salary || 'N/A',
        experience: post.experience || 'N/A',
        openings: post.openings || 0,
        postedAt: post.postedAt || null,
        skills: post.skills || [],
        description: post.description || 'N/A',
      }));
    });

    // Optional: sort all jobs by postedAt descending
    result.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

    res.json(result);
  } catch (err) {
    console.error('Recruiters summary error:', err);
    res.status(500).json({ message: 'Error fetching recruiters summary' });
  }
});



router.get('/summary1', verifyToken, async (req, res) => {
  try {
    const recruiters = await RecruiterProfile.find()
      .populate('userId', 'name email')
      .lean();

    const recruiterData = recruiters.map(r => {
      const sortedPosts = [...(r.jobPosts || [])].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
      const latestPost = sortedPosts[0];

      return {
        name: r.userId?.name || r.fullName || 'N/A',
        email: r.userId?.email || 'N/A',
        companyName: latestPost?.companyName || r.companyName || 'N/A',
        status: r.emailVerified ? 'Verified' : 'Pending',
        jobCount: r.jobPosts?.length || 0,
        createdAt: r.createdAt,
      };
    });

    // ✅ Sort recruiters by jobCount descending
    recruiterData.sort((a, b) => b.jobCount - a.jobCount);

    res.json({ recruiters: recruiterData });
  } catch (err) {
    console.error('Recruiters summary error:', err);
    res.status(500).json({ message: 'Error fetching recruiters summary' });
  }
});


module.exports = router;
