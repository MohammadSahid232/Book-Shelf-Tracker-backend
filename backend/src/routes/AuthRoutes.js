const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const AuthController = require('../controllers/AuthController');
const verifyToken = require('../middlewares/VerifyToken');
const UserModel = require('../models/UserModel');
require('dotenv').config();

const frontend_url = process.env.FRONTEND_URL || 'http://localhost:5173';

// Register route
router.post('/register', AuthController.registerUser);

// Login route
router.post('/login', AuthController.loginUser);

// Get current user profile (protected)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all users (admin only, protected)
router.get('/users', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify Token (protected) — confirms token is valid and returns decoded user
router.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Token is valid',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Google OAuth routes
router.get(
  '/google',
  (req, res, next) => {
    console.log('\n========================================');
    console.log('🔑 [Google Auth Console] Initiating Google OAuth Login Request...');
    console.log('========================================\n');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('🔄 [Google Auth Console] Received Callback from Google OAuth Server...');
    next();
  },
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    console.log(`✅ [Google Auth Console] Successfully authenticated user: ${req.user.email}`);

    // Successful authentication, generate JWT and send it to the client
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1h' }
    );
    const user = {
      id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role
    };
    res.redirect(`${frontend_url}/oauth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

module.exports = router;
