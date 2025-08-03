const Job = require('../models/job.model.js');
const Application = require('../models/application.model.js');
const User = require('../models/user.model.js');

const getAllJobs = async (req, res) => {
  try {
    console.log('--- Received Filters ---', req.query);

    const { role, location, type } = req.query;
    
    const queryObject = {
      status: 'Active'
    };

    if (role && typeof role === 'string' && role.trim() !== '') {
      queryObject.title = { $regex: role.trim(), $options: 'i' };
    }
    
    if (location && typeof location === 'string' && location.trim() !== '') {
      queryObject.location = { $regex: location.trim(), $options: 'i' };
    }
    
    if (type && type !== 'All') {
      queryObject.roleType = type;
    }

    console.log('--- Constructed MongoDB Query ---', queryObject);

    const jobs = await Job.find(queryObject).sort({ createdAt: -1 });

    const jobsWithCount = await Promise.all(jobs.map(async (job) => {
        const applicants = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicants };
    }));

    res.json(jobsWithCount);

  } catch (error) {
    console.error("Error in getAllJobs:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- The rest of the functions in this file ---

const createJob = async (req, res) => {
    try {
        const { title, description, salary, roleType, workMode, location, tags } = req.body;
        const job = new Job({
            title, company: req.user.company, description, salary, roleType, workMode, location,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            recruiter: req.user._id
        });
        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        console.error("Error in createJob:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        job.title = req.body.title || job.title;
        job.description = req.body.description || job.description;
        job.salary = req.body.salary || job.salary;
        job.location = req.body.location || job.location;
        job.roleType = req.body.roleType || job.roleType;
        job.workMode = req.body.workMode || job.workMode;
        job.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : job.tags;
        const updatedJob = await job.save();
        res.json(updatedJob);
    } catch (error) {
        console.error("Error in updateJob:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate({ path: 'job', select: 'title company' })
            .sort({ createdAt: -1 });
        const formattedApplications = applications.map(app => ({
            id: app._id,
            jobId: app.job?._id,
            jobTitle: app.job?.title || 'Job Deleted',
            company: app.job?.company || 'N/A',
            status: app.status
        }));
        res.json(formattedApplications);
    } catch (error) {
        console.error("Error in getMyApplications:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const applyToJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { name, email, skills, readyToJoin } = req.body;
        const existingApplication = await Application.findOne({ job: jobId, applicant: req.user._id });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const applicantSkills = skills.split(',').map(s => s.trim().toLowerCase());
        const jobSkills = job.tags.map(s => s.trim().toLowerCase());
        const matchingSkills = jobSkills.filter(skill => applicantSkills.includes(skill));
        let matchScore = 0;
        if (jobSkills.length > 0) {
            matchScore = Math.round((matchingSkills.length / jobSkills.length) * 100);
        }
        const newApplication = new Application({
            job: jobId, applicant: req.user._id, name, email, skills, readyToJoin,
            resumeUrl: req.file.path, matchScore: matchScore
        });
        await newApplication.save();
        await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });
        res.status(201).json({ message: 'Application submitted successfully!', matchScore });
    } catch (error) {
        console.error("Error in applyToJob:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getRecommendedJobs = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.skills || user.skills.length === 0) {
            return res.json([]);
        }
        const recommendedJobs = await Job.find({
            tags: { $in: user.skills },
            status: 'Active',
            recruiter: { $ne: req.user._id }
        }).sort({ createdAt: -1 }).limit(10);
        res.json(recommendedJobs);
    } catch (error) {
        console.error("Error in getRecommendedJobs:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) { res.json(job); } 
    else { res.status(404).json({ message: 'Job not found' }); }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
    getAllJobs, createJob, updateJob, getMyApplications, 
    applyToJob, getRecommendedJobs, getJobById
};