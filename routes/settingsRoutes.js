const express = require('express');
const router = express.Router();
const {
    getHeaderVisibility,
    updateHeaderVisibility,
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public read — ModelSearch.jsx calls this on load
router.get('/header-visibility', getHeaderVisibility);

// Admin-only write — AdminSettings calls this when saving
router.put('/header-visibility', protect, admin, updateHeaderVisibility);

module.exports = router;
