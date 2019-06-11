const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/keys');
const validator = require('validator');
const auth = require('../../middleware/auth');

// Load validation functions
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
// Load helper functions
const startCase = require('../../helpers/startCase');

// Load Models
const User = require('../../models/User');
const Profile = require('../../models/Profile');

const saltRounds = 10;

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    next(err);
  }
});

// @route   GET api/users/all
// @desc    Get all users
// @access  Public
router.get('/all', async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    next(err);
  }
});

// @route   POST api/users/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { name, email, password, username } = req.body;

  try {
    // Check if user with that email/username already exists in db
    let user = await User.findOne({ email });
    if (user) {
      errors.email = 'User with that email has already been created';
      return res.status(400).json(errors);
    }

    user = await User.findOne({ username });
    if (user) {
      errors.username = 'User with that username has already been created';
      return res.status(400).json(errors);
    }

    // There is no user with that email/username in db, create the user
    user = new User({
      name: startCase(name), // (start case, john doe -> John Doe)
      username,
      email,
      password
    });

    // Create empty profile for that user
    const profile = new Profile({});

    // Hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    profile.user = user._id;
    await profile.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };
    // Sign token
    jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) return next(err);
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
});

// @route   POST api/users/login
// @desc    Login user / Returning JWT
// @access  Public
router.post('/login', async (req, res, next) => {
  const { isValid, errors } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { username, password } = req.body;
  /*
    1. Server will receive username and password
    2. Username can be user username or email
    3. Check if username is user username or email
  */
  let login = 'username';
  if (validator.isEmail(username)) {
    login = 'email';
  }

  try {
    const user = await User.findOne({ [login]: username });
    if (!user) {
      errors.login = 'Incorrect username and password combination';
      return res.status(400).json(errors);
    }

    // Check passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errors.login = 'Incorrect username and password combination';
      return res.status(400).json(errors);
    }

    // User matched
    // Create JWT Payload
    const payload = {
      user: {
        id: user.id
      }
    };
    // Sign token
    jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) return next(err);
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
});

// @route   GET api/users/:user_id
// @desc    Get user by ID
// @access  Public
router.get('/:user_id', async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const user = await User.findById(user_id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    next(err);
  }
});

module.exports = router;
