const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) { res.status(401).json({ message: 'Not authorized, token failed' }); }
  }
  if (!token) res.status(401).json({ message: 'Not authorized, no token' });
};

const isRecruiter = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter') next();
  else res.status(403).json({ message: 'Not authorized as a recruiter' });
};

const isJobSeeker = (req, res, next) => {
  if (req.user && req.user.role === 'jobseeker') next();
  else res.status(403).json({ message: 'Not authorized as a job seeker' });
};

module.exports = { protect, isRecruiter, isJobSeeker };