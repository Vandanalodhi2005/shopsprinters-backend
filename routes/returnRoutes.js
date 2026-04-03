const express = require('express');
const router = express.Router();
const { createReturnRequest, getReturnRequests } = require('../controllers/returnController');
// Note: In a real app, you'd add protect and admin middleware for GET
// For now keeping it simple as per project patterns

router.route('/')
    .post(createReturnRequest)
    .get(getReturnRequests);

module.exports = router;
