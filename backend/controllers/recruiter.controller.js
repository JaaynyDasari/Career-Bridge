const Job = require('../models/job.model.js');
const Application = require('../models/application.model.js');

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    const jobsWithCount = await Promise.all(jobs.map(async (job) => ({ ...job.toObject(), applicants: await Application.countDocuments({ job: job._id }) })));
    res.json(jobsWithCount);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getDashboardStats = async (req, res) => {
  try {
    const myJobIds = (await Job.find({ recruiter: req.user._id }).select('_id')).map(job => job._id);
    const totalJobs = myJobIds.length;
    const totalApplicants = await Application.countDocuments({ job: { $in: myJobIds } });
    const shortlisted = await Application.countDocuments({ job: { $in: myJobIds }, status: 'Shortlisted' });
    res.json({ totalJobs, totalApplicants, shortlisted, growth: '+23%' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};


const getApplicantsForJob = async (req, res) => {
    try {
        // Find all applications for the given job ID
        // We DO NOT need to populate anything, because all the data (name, email, skills, resumeUrl)
        // is saved directly on the Application model itself.
        const applications = await Application.find({ job: req.params.jobId })
            .sort({ matchScore: -1 }); // Sort by highest match score first
            
        console.log(`Found ${applications.length} applications for job ${req.params.jobId}:`, applications);
        
        res.json(applications);
    } catch (error) {
        console.error("CRITICAL ERROR in getApplicantsForJob:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// --- This function is correct and does not need changes ---
const updateApplicationStatus = async (req, res) => {
    const { status } = req.body;
    const { applicationId } = req.params;
    try {
        const application = await Application.findById(applicationId).populate('job');
        if (!application || application.job.recruiter.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        application.status = status;
        await application.save();
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = { 
    getMyJobs, 
    getDashboardStats, 
    getApplicantsForJob, 
    updateApplicationStatus 
};