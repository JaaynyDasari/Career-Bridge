const express = require('express');
const { 
    getMyJobs, 
    getDashboardStats, 
    getApplicantsForJob, 
    updateApplicationStatus 
} = require('../controllers/recruiter.controller.js');
const { protect, isRecruiter } = require('../middleware/auth.middleware.js');
const router = express.Router();

// This middleware applies to all routes in this file
router.use(protect, isRecruiter);

// Existing routes
router.get('/jobs', getMyJobs);
router.get('/stats', getDashboardStats);

// --- CORRECTED ROUTE ---
// The path now correctly includes '/jobs/' to match the frontend request.
router.get('/jobs/:jobId/applications', getApplicantsForJob);

// This route is also corrected for consistency.
router.put('/applications/:applicationId/status', updateApplicationStatus);

module.exports = router;