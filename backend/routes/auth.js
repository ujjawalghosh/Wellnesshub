const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/email');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'wellnesshub_secret_key',
    { expiresIn: '30d' }
  );
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    console.log('Registration attempt:', { email, name });

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = new User({
      email,
      password,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully:', user._id);

    const token = generateToken(user._id);
    console.log('Token generated successfully');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        goals: user.goals,
        fitnessLevel: user.fitnessLevel,
        points: user.points,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error message
    let errorMessage = 'Server error';
    if (error.name === 'MongoServerError') {
      errorMessage = 'Database error: ' + error.message;
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + error.message;
    } else {
      errorMessage = error.message;
    }
    
    res.status(500).json({ message: errorMessage, error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return a single error message instead of array
      const errorMessage = errors.array()[0]?.msg || 'Validation error';
      return res.status(400).json({ message: errorMessage });
    }

    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found, comparing password...');
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password matched, updating last active...');

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    const token = generateToken(user._id);
    console.log('Login successful for user:', email);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        goals: user.goals,
        fitnessLevel: user.fitnessLevel,
        points: user.points,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error message
    let errorMessage = 'Server error';
    if (error.name === 'MongoServerError') {
      errorMessage = 'Database error: ' + error.message;
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + error.message;
    } else {
      errorMessage = error.message;
    }
    
    res.status(500).json({ message: errorMessage, error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      goals: req.user.goals,
      fitnessLevel: req.user.fitnessLevel,
      points: req.user.points,
      level: req.user.level,
      badges: req.user.badges,
      streakFreeze: req.user.streakFreeze,
      preferences: req.user.preferences,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, goals, fitnessLevel, preferences } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (goals) updates.goals = goals;
    if (fitnessLevel) updates.fitnessLevel = fitnessLevel;
    if (preferences) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update avatar
router.put('/avatar', auth, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== OTP AUTHENTICATION ROUTES ====================

// Send OTP to email (for OTP Login)
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email. Please register first.' });
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, 'login');
    
    // Check if email credentials are configured (for development debugging)
    const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    res.json({ 
      message: 'OTP sent successfully to your email',
      // Return OTP for testing if:
      // 1. In development mode, OR
      // 2. Email credentials are not configured (so user can test)
      ...((process.env.NODE_ENV === 'development' || !emailConfigured) && { devOTP: otp })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and login (OTP Login)
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP
    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification
    user.clearOTP();
    user.lastActive = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        goals: user.goals,
        fitnessLevel: user.fitnessLevel,
        points: user.points,
        level: user.level,
        badges: user.badges,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register with Email Verification
router.post('/register-with-verification', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (not verified yet)
    user = new User({
      email,
      password,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      isVerified: false
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send verification email
    const emailResult = await sendOTPEmail(email, otp, 'verification');
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    // Don't return token yet - user needs to verify email first
    res.status(201).json({
      message: 'Registration successful. Please verify your email with the OTP sent to your inbox.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: false
      },
      // In development mode, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Email with OTP
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified. Please login.' });
    }

    // Verify OTP
    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP and mark as verified
    user.clearOTP();
    user.isVerified = true;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        goals: user.goals,
        fitnessLevel: user.fitnessLevel,
        points: user.points,
        level: user.level,
        badges: user.badges,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Determine email type based on verification status
    const emailType = user.isVerified ? 'login' : 'verification';
    
    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, emailType);
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    res.json({ 
      message: 'OTP resent successfully to your email',
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enable 2FA for account
router.post('/enable-2fa', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP for 2FA setup
    const otp = user.generateOTP();
    await user.save();

    // Send 2FA setup email
    const emailResult = await sendOTPEmail(user.email, otp, '2fa');
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    res.json({ 
      message: '2FA setup OTP sent to your email. Verify to enable 2FA.',
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', auth, [
  body('otp').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP
    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP (2FA is now enabled - you might want to store this differently)
    user.clearOTP();
    await user.save();

    res.json({
      message: '2FA enabled successfully!',
      twoFactorEnabled: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disable 2FA
router.post('/disable-2fa', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear any existing OTP fields (2FA disabled)
    user.clearOTP();
    await user.save();

    res.json({
      message: '2FA disabled successfully!',
      twoFactorEnabled: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login with Password + 2FA (if 2FA is enabled)
router.post('/login-with-2fa', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  body('otp').optional().isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password first
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If 2FA is enabled, require OTP
    if (user.twoFactorEnabled) {
      if (!otp) {
        return res.status(400).json({ 
          message: '2FA is enabled. Please provide OTP.',
          requiresOTP: true 
        });
      }

      const isValidOTP = user.verifyOTP(otp);
      if (!isValidOTP) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      user.clearOTP();
    }

    user.lastActive = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        goals: user.goals,
        fitnessLevel: user.fitnessLevel,
        points: user.points,
        level: user.level,
        badges: user.badges,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
