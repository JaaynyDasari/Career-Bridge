const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: Number, required: true }, 
  roleType: { type: String, required: true },
  workMode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], required: true },
  location: { type: String, required: true },
  tags: [{ type: String }],
  recruiter: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;