const express = require('express');
const { sendContactMessage, getMyMessages } = require('../controllers/contactController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/:propertyId', optionalAuth, sendContactMessage);
router.get('/my-messages', protect, getMyMessages);

module.exports = router;
