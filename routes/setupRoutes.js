const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const SiteSettings = require('../models/SiteSettings');
const { sendRegistrationEmail } = require('../utils/setupMailer');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';

// Middleware for JWT authentication
function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.username === ADMIN_USER) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

async function getSettings() {
  let doc = await SiteSettings.findOne({ key: 'global' }).lean();
  if (!doc) {
      doc = {
        showHeader: true,
        showLogo: true,
        allowModelSearch: true,
        allowInstallationFailed: true,
        allowCompleteSetup: true
      };
  }
  return doc;
}

async function setSettings(settings) {
  await SiteSettings.updateOne({ key: 'global' }, { $set: settings }, { upsert: true });
}

// Registration endpoint: store form data and send email
router.post('/register', async (req, res) => {
  try {
    const { model, name, phone, email, agree } = req.body;
    if (!model || !name || !phone || !email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Save to DB
    const reg = new Registration({ model, name, phone, email, agree });
    await reg.save();
    // Send email
    try {
        await sendRegistrationEmail({ model, name, phone, email, agree });
    } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
    }
    res.json({ success: true });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ error: 'Failed to register.' });
  }
});

// Get header and logo visibility
router.get('/header-visibility', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      showHeader: settings.showHeader !== false,
      showLogo: settings.showLogo !== false,
      allowModelSearch: settings.allowModelSearch !== false,
      showCompleteSetupPage: settings.allowCompleteSetup !== false,
      showInstallationErrorPage: settings.allowInstallationFailed !== false
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load settings.' });
  }
});

// Set header and logo visibility (protected)
router.post('/header-visibility', adminAuth, async (req, res) => {
  const {
    showHeader,
    showLogo,
    allowModelSearch,
    showCompleteSetupPage,
    showInstallationErrorPage
  } = req.body;
  const settings = {
    showHeader: typeof showHeader === 'boolean' ? showHeader : true,
    showLogo: typeof showLogo === 'boolean' ? showLogo : true,
    allowModelSearch: typeof allowModelSearch === 'boolean' ? allowModelSearch : true,
    allowCompleteSetup: typeof showCompleteSetupPage === 'boolean' ? showCompleteSetupPage : true,
    allowInstallationFailed: typeof showInstallationErrorPage === 'boolean' ? showInstallationErrorPage : true
  };
  try {
    await setSettings(settings);
    res.json({ success: true, ...settings });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to update settings.' });
  }
});

// Admin login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
