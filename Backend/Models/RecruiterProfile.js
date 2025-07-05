const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth' },
  name: String,
  email: String,
  resume: String, 
  address: String,
  profileImage:String, 
  applicationStatus: {
    type: String,
    enum: ['applied', 'shortlist', 'maybe', 'reject'],
    default: 'applied',
  },
  appliedAt: { type: Date, default: Date.now },
});

const jobPostSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  salary: { type: String, required: true },
  experience: { type: String, required: true }, 
  location: { type: String, required: true },
  description: { type: String, required: true },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], default: 'Full-time' },
  remote: { type: Boolean, default: false },
  skills: { type: [String], default: [] },
  recruiterEmail: { type: String, required: true },
  openings: { type: Number, default: 1 },
  applicants: [applicantSchema],
  postedAt: { type: Date, default: Date.now },
});

const recruiterProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAuth', required: true },
    fullName: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    profileImage: {
      type: String,
      default: 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg',
    },
    companyName: { type: String, default: null },
    companyWebsite: { type: String, default: null },
    jobPosts: [jobPostSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
