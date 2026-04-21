const User = require('../models/User');
const Property = require('../models/Property');
const Contact = require('../models/Contact');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, total, users, totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });

    await Property.deleteMany({ owner: user._id });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all properties (admin)
// @route   GET /api/admin/properties
// @access  Admin
const getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Property.countDocuments();
    const properties = await Property.find()
      .populate('owner', 'name email')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, total, properties, totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle property featured status
// @route   PUT /api/admin/properties/:id/featured
// @access  Admin
const toggleFeatured = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    property.isFeatured = !property.isFeatured;
    await property.save();
    res.json({ success: true, message: `Property ${property.isFeatured ? 'featured' : 'unfeatured'}`, property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, totalProperties, availableProperties,
      soldProperties, totalContacts
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Property.countDocuments(),
      Property.countDocuments({ status: 'available' }),
      Property.countDocuments({ status: 'sold' }),
      Contact.countDocuments()
    ]);

    const recentProperties = await Property.find()
      .populate('owner', 'name')
      .sort('-createdAt')
      .limit(5);

    const recentUsers = await User.find({ role: 'user' })
      .select('name email createdAt')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      stats: { totalUsers, totalProperties, availableProperties, soldProperties, totalContacts },
      recentProperties,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllUsers, toggleUserStatus, deleteUser, getAllProperties, toggleFeatured, getDashboardStats };
