const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/Auth');
const JobSeekerProfile = require('../Models/JobSeekerProfile');
const UserAuth = require('../Models/UserAuth');
const RecruiterProfile = require('../Models/RecruiterProfile');

// routes/userRoutes.js
router.post('/userdata', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userProfile = await JobSeekerProfile.findOne({ userId });
    if (!userProfile) return res.status(404).json({ message: 'User not found' });

    res.json(userProfile);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
//
router.post('/userdetails', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching user details for:', userId);

    const userProfile = await JobSeekerProfile.findOne({ userId }).populate({
      path: 'userId',
      select: 'email',
    });

    if (!userProfile) {
      console.log('User profile not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const responseData = {
      id: userProfile.userId?._id, 
      fullName: userProfile.fullName,
      resume: userProfile.resume,
      address: userProfile.personalDetails?.address || '',
      email: userProfile.userId?.email || '',
      profileImage: userProfile.profileImage || 'https://randomuser.me/api/portraits',
    };

    console.log('User profile response:', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('Error fetching user data:', err.stack); 
    res.status(500).json({ message: 'Server error' });
  }
});




// GET Basic Details
router.get('/basic-details', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await JobSeekerProfile.findOne({ userId }).select('fullName basicDetails');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT Update Basic Details
router.put('/update-basic', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      location,
      experiences,
      ctc,
      expectedCtc,
      noticePeriod,
      currentlyServingNotice,
      noticeEndDate,
    } = req.body;

    const updatedUser = await JobSeekerProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          'basicDetails.location': location,
          'basicDetails.experience': experiences,
          'basicDetails.ctc': ctc,
          'basicDetails.expectedCtc': expectedCtc,
          'basicDetails.noticePeriod': noticePeriod,
          'basicDetails.currentlyServingNotice': currentlyServingNotice,
          'basicDetails.noticeEndDate': currentlyServingNotice ? noticeEndDate : null,
        },
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Basic details updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT Update Professional Details
router.put('/update-professional', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentIndustry, department, designation } = req.body;

    const updatedUser = await JobSeekerProfile.findOneAndUpdate(
      { userId },
      {
        'professionalDetails.currentIndustry': currentIndustry || '',
        'professionalDetails.department': department || '',
        'professionalDetails.designation': designation || '',
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Professional details updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT Update Personal Details
router.put('/update-personal', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, disability, dob, gender, maritalStatus, languages } = req.body;

    const updatedUser = await JobSeekerProfile.findOneAndUpdate(
      { userId },
      {
        'personalDetails.address': address,
        'personalDetails.isDisabled': disability === 'yes',
        'personalDetails.dateOfBirth': dob,
        'personalDetails.gender': gender,
        'personalDetails.maritalStatus': maritalStatus,
        'personalDetails.languages': languages || [],
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Personal details updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT Update Skills
router.put('/update-skills', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;

    const updatedUser = await JobSeekerProfile.findOneAndUpdate(
      { userId },
      { 'skills.technologies': skills },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Skills updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT Update Roles and Responsibilities
router.put('/update-roles', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { summaries } = req.body;
    if (!Array.isArray(summaries)) return res.status(400).json({ message: 'Summaries must be an array' });

    const updatedUser = await JobSeekerProfile.findOneAndUpdate(
      { userId },
      { 'rolesAndResponsibilities.summaries': summaries },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Roles updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST Add Education
router.post('/add-education', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const education = req.body;

    const user = await JobSeekerProfile.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.education.push(education);
    await user.save();

    res.status(201).json({ message: 'Education added', education: user.education.at(-1) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT Update Education
router.put('/update-education', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      id,
      qualification,
      board,
      medium,
      percentage,
      yearOfPassing,
      course,
      college,
      grading,
      cgpa,
      courseType,
      startYear,
      endYear,
    } = req.body;

    const user = await JobSeekerProfile.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const eduIndex = user.education.findIndex((e) => e._id.toString() === id);
    if (eduIndex === -1) return res.status(404).json({ message: 'Education not found' });

    const updatedEdu = {
      qualification,
      board,
      medium,
      percentage,
      yearOfPassing,
      course,
      college,
      grading,
      cgpa,
      courseType,
      startYear,
      endYear,
    };

    user.education[eduIndex] = updatedEdu;
    await user.save();

    res.json({ message: 'Education updated', education: updatedEdu });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT Update Employment
router.put('/update-employment', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      id,
      company,
      jobTitle,
      isCurrentCompany,
      currentSalary,
      startDate,
      endDate,
      isOngoing,
      payType,
      experience,
      projects,
      responsibilities,
    } = req.body;

    const user = await JobSeekerProfile.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.employmentDetailsList.findIndex((e) => e._id.toString() === id);
    if (index === -1) return res.status(404).json({ message: 'Employment not found' });

    user.employmentDetailsList[index] = {
      company,
      jobTitle,
      isCurrentCompany,
      currentSalary,
      startDate,
      endDate,
      isOngoing,
      payType,
      experience,
      projects,
      responsibilities,
    };

    await user.save();
    res.json({ message: 'Employment updated', employment: user.employmentDetailsList[index] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST Add Employment
router.post('/add-employment', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const employment = req.body;

    const user = await JobSeekerProfile.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.employmentDetailsList.push(employment);
    await user.save();

    res.status(201).json({ message: 'Employment added', employment: user.employmentDetailsList.at(-1) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

//recommended candidates
router.get('/all', verifyToken, async (req, res) => {
  console.log("Requested for users");
  try {
    
    const seekers = await JobSeekerProfile.find(
      {},
      'fullName profileImage professionalDetails.designation userId'
    );

    res.status(200).json(seekers);
  } catch (err) {
    console.error('Failed to fetch job seekers:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post('/settings', verifyToken, async (req, res) => {
 
  try {
    const userId = req.user.id; 
    const user = await UserAuth.findById(userId);
    if (!user) {
      //console.log('User not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    let profile;
    
    if (user.role === 'jobSeeker') {
      
      profile = await JobSeekerProfile.findOne({ userId });
    } else if (user.role === 'recruiter') {
     
      profile = await RecruiterProfile.findOne({ userId });
    }
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json({
      email: user.email,
      password: user.password,
      mobileNumber: profile.mobileNumber,
      emailVerified: profile.emailVerified,
      mobileVerified: profile.mobileVerified,
    });
  } catch (error) {
    console.error('Error in settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// DELETE employment
router.delete('/employment/:userId/:employmentId', verifyToken, async (req, res) => {
  const { userId, employmentId } = req.params;
  console.log(`Deleting employment for userId: ${userId}, employmentId: ${employmentId}`);

  try {
    const profile = await JobSeekerProfile.findOneAndUpdate(
      { userId },
      { $pull: { employmentDetailsList: { _id: employmentId } } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'User not found or no employment entry deleted' });
    }

    res.status(200).json({ message: 'Employment entry deleted successfully', profile });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error while deleting employment entry' });
  }
});

// DELETE education
router.delete('/education/:userId/:educationId', verifyToken, async (req, res) => {
  const { userId, educationId } = req.params;
  console.log(`Deleting education for userId: ${userId}, educationId: ${educationId}`);

  try {
    const profile = await JobSeekerProfile.findOneAndUpdate(
      { userId },
      { $pull: { education: { _id: educationId } } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'User not found or no education entry deleted' });
    }

    res.status(200).json({ message: 'Education entry deleted successfully', profile });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error while deleting education entry' });
  }
});

router.get('/check-email-verified/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Checking email verification for userId:', userId);

    const profile = await JobSeekerProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found', verified: false });
    }

    return res.status(200).json({ verified: profile.emailVerified });
  } catch (err) {
    console.error('Email verification check failed:', err);
    return res.status(500).json({ message: 'Server error', verified: false });
  }
});




module.exports = router;
