const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Save/Unsave a property
// @route   POST /api/users/saved/:propertyId
// @access  Private
const toggleSavedProperty = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isSaved = user.savedProperties.includes(propertyId);

    if (isSaved) {
      user.savedProperties = user.savedProperties.filter(
        (id) => id.toString() !== propertyId
      );
      await user.save();
      res.json({ success: true, message: 'Property removed from saved', saved: false });
    } else {
      user.savedProperties.push(propertyId);
      await user.save();
      res.json({ success: true, message: 'Property saved successfully', saved: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get saved properties
// @route   GET /api/users/saved
// @access  Private
const getSavedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedProperties',
      populate: { path: 'owner', select: 'name email phone' }
    });
    res.json({ success: true, properties: user.savedProperties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { toggleSavedProperty, getSavedProperties };
