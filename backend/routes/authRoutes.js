const express = require('express');
const router = express.Router();
const {
  googleAuth,
  register,
  login,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/google', googleAuth);
router.post('/register', register);
router.post('/login', login);

// Protected authentication routes
router.get('/me', protect, getMe);

module.exports = router;
