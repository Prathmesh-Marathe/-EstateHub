const express = require('express');
const { toggleSavedProperty, getSavedProperties } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.post('/saved/:propertyId', protect, toggleSavedProperty);
router.get('/saved', protect, getSavedProperties);

module.exports = router;
