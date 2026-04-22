const express = require('express');
const router = express.Router();
const { getShippingRates } = require('../controllers/shippingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/rates', getShippingRates);

module.exports = router;
