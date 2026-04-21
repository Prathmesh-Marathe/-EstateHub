const express = require('express');
const {
  getProperties, getProperty, createProperty,
  updateProperty, deleteProperty, getMyProperties, getFeaturedProperties
} = require('../controllers/propertyController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/featured', getFeaturedProperties);
router.get('/my-properties', protect, getMyProperties);
router.get('/', optionalAuth, getProperties);
router.get('/:id', optionalAuth, getProperty);
router.post('/', protect, upload.array('images', 10), createProperty);
router.put('/:id', protect, upload.array('images', 10), updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;
