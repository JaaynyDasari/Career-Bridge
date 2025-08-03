const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Job' },
  applicant: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  skills: { type: String, required: true },
  readyToJoin: { type: String, enum: ['Yes', 'No'], required: true },
  resumeUrl: { type: String, required: true },
  matchScore: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Shortlisted', 'Rejected'], default: 'Pending' },
}, { timestamps: true });
const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;