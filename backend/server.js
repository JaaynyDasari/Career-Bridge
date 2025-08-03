require('./config.js'); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

const { registerUser, loginUser } = require('./controllers/auth.controller.js');
const { createJob, getAllJobs, getMyApplications, applyToJob, getRecommendedJobs, getJobById, updateJob } = require('./controllers/job.controller.js');
const { getUserProfile, updateUserProfile } = require('./controllers/user.controller.js');
const { getMyJobs, getDashboardStats, getApplicantsForJob, updateApplicationStatus } = require('./controllers/recruiter.controller.js');

const { protect, isRecruiter, isJobSeeker } = require('./middleware/auth.middleware.js');
const upload = require('./middleware/upload.js');

connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`INCOMING REQUEST: ${req.method} ${req.originalUrl}`);
    next();
});

app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);


app.get('/api/jobs', protect, getAllJobs); 

app.post('/api/jobs', protect, isRecruiter, createJob);
app.get('/api/jobs/my-applications', protect, isJobSeeker, getMyApplications);
app.get('/api/jobs/recommended', protect, isJobSeeker, getRecommendedJobs);
app.post('/api/jobs/:id/apply', protect, isJobSeeker, upload.single('resume'), applyToJob);
app.get('/api/jobs/:id', protect, getJobById); 
app.put('/api/jobs/:id', protect, isRecruiter, updateJob); 

app.get('/api/users/profile', protect, getUserProfile);
app.put('/api/users/profile', protect, upload.single('resume'), updateUserProfile);

app.get('/api/recruiter/jobs', protect, isRecruiter, getMyJobs);
app.get('/api/recruiter/stats', protect, isRecruiter, getDashboardStats);
app.get('/api/recruiter/jobs/:jobId/applications', protect, isRecruiter, getApplicantsForJob);
app.put('/api/recruiter/applications/:applicationId/status', protect, isRecruiter, updateApplicationStatus);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log("==============================================");
    console.log("COMPLETE BACKEND IS RUNNING in a single file.");
    console.log(`Server is live on port ${PORT}`);
    console.log("All routes are registered. The 404 error should be gone.");
    console.log("==============================================");
});