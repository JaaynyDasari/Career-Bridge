const User = require('../models/user.model.js');

const getUserProfile = async (req, res) => {
    try {
        console.log("SUCCESS: getUserProfile controller function was reached."); // ADDED LOG
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) { 
        console.error("Error in getUserProfile:", error);
        res.status(500).json({ message: "Server Error" }); 
    }
};


const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.age = req.body.age || user.age;
            user.education = req.body.education || user.education;
            
            if (req.body.skills) {
                user.skills = req.body.skills.split(',').map(skill => skill.trim());
            } else {
                user.skills = []; 
            }
            
            if (req.file) {
                user.resumeUrl = req.file.path;
            }
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) { 
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ message: "Server Error" }); 
    }
};

// ... (keep module.exports)

module.exports = { getUserProfile, updateUserProfile };