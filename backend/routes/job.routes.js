const express = require('express');
const { 
    getAllJobs, 
    getMyApplications, 
    createJob, 
    applyToJob, 
    getRecommendedJobs,
    getJobById,
    updateJob
} = require('../controllers/job.controller.js');
const { protect, isRecruiter, isJobSeeker } = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.js');
const router = express.Router();

router.route('/')
    .get(protect, getAllJobs)
    .post(protect, isRecruiter, createJob);
    
router.get('/my-applications', protect, isJobSeeker, getMyApplications);
router.get('/recommended', protect, isJobSeeker, getRecommendedJobs);

router.route('/:id')
    .get(protect, getJobById) 
    .put(protect, isRecruiter, updateJob); 

router.post('/:id/apply', protect, isJobSeeker, upload.single('resume'), applyToJob);

module.exports = router;