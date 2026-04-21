const Contact = require('../models/Contact');
const Property = require('../models/Property');

// @desc    Send contact message to property owner
// @route   POST /api/contact/:propertyId
// @access  Public
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const contact = await Contact.create({
      property: req.params.propertyId,
      sender: req.user ? req.user._id : undefined,
      name, email, phone, message
    });

    res.status(201).json({ success: true, message: 'Message sent successfully', contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get messages for property owner
// @route   GET /api/contact/my-messages
// @access  Private
const getMyMessages = async (req, res) => {
  try {
    // Get all properties owned by user, then find contacts for those
    const userProperties = await Property.find({ owner: req.user._id }).select('_id');
    const propertyIds = userProperties.map((p) => p._id);

    const messages = await Contact.find({ property: { $in: propertyIds } })
      .populate('property', 'title')
      .sort('-createdAt');

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { sendContactMessage, getMyMessages };
