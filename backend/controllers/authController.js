const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Fail fast at startup if JWT_SECRET is not set — never fall back to a hardcoded string
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET is not set in environment variables. Set it in your .env file.');
}

const getJwtSecret = () => process.env.JWT_SECRET;

const getGoogleClientId = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('FATAL: GOOGLE_CLIENT_ID is not set in environment variables. Set it in your .env file.');
  }
  return process.env.GOOGLE_CLIENT_ID;
};

// Generate JWT for ProjectLens authentication
const generateToken = (userId, email) => {
  return jwt.sign({ id: userId, email }, getJwtSecret(), {
    expiresIn: '7d',
  });
};


/**
 * @desc    Authenticate user with Google ID Token / Credential
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = async (req, res) => {
  try {
    const { credential, idToken, token } = req.body;
    const rawToken = credential || idToken || token;

    if (!rawToken) {
      return res.status(400).json({
        success: false,
        error: 'Google authentication credential is required',
      });
    }

    const clientId = getGoogleClientId();
    const client = new OAuth2Client(clientId);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: rawToken,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired Google credential. Please try signing in again.',
      });
    }

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Unable to retrieve verified profile from Google',
      });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Google account has no associated email address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // CASE A: User already exists with this Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      // If user exists, sync profile picture if not set
      if (!user.avatar && picture) {
        user.avatar = picture;
        await user.save();
      }
    } else {
      // CASE B: User exists with the same verified email, but no googleId linked yet
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        user.googleId = googleId;
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        await user.save();
      } else {
        // CASE C: Brand new user - create new account
        user = await User.create({
          name: name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          googleId,
          avatar: picture || '',
          authProvider: 'google',
        });
      }
    }

    const authToken = generateToken(user._id, user.email);

    return res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || picture || '',
        bio: user.bio || '',
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error('Google authentication error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during Google sign-in. Please try again.',
    });
  }
};

/**
 * @desc    Register a new local user with email & password
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please login instead.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      authProvider: 'local',
    });

    const token = generateToken(user._id, user.email);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        bio: user.bio || '',
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error during registration',
    });
  }
};

/**
 * @desc    Authenticate local user with email & password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        error: 'This account was created with Google. Please use "Continue with Google" to sign in.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.email);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        bio: user.bio || '',
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error during login',
    });
  }
};

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected by authMiddleware)
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar || '',
        bio: req.user.bio || '',
        authProvider: req.user.authProvider,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile',
    });
  }
};

module.exports = {
  googleAuth,
  register,
  login,
  getMe,
};
