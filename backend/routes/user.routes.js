const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/user.controller.js');
const { protect } = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.js');

console.log("--- Loading user.routes.js ---"); // ADDED LOG

// This defines the GET and PUT methods for the '/profile' sub-route
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('resume'), updateUserProfile);

console.log("SUCCESS: /profile route defined."); // ADDED LOG

module.exports = router;