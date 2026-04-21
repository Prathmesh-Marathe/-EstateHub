const Property = require('../models/Property');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all properties with search & filter
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    const {
      search, type, priceType, minPrice, maxPrice,
      city, state, bedrooms, page = 1, limit = 9, sort = '-createdAt'
    } = req.query;

    const query = { status: 'available' };

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (type) query.type = type;
    if (priceType) query.priceType = priceType;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (state) query['location.state'] = { $regex: state, $options: 'i' };
    if (bedrooms) query['features.bedrooms'] = { $gte: parseInt(bedrooms) };

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('owner', 'name email phone avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone avatar createdAt');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Increment view count
    property.views += 1;
    await property.save();

    res.json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private
const createProperty = async (req, res) => {
  try {
    const {
      title, description, price, priceType, type,
      address, city, state, country, zipCode,
      bedrooms, bathrooms, area, parking, furnished, yearBuilt,
      amenities
    } = req.body;

    // Process uploaded images from Cloudinary
    const images = req.files
      ? req.files.map((file) => ({
          url: file.path,
          publicId: file.filename
        }))
      : [];

    const property = await Property.create({
      title,
      description,
      price: parseFloat(price),
      priceType,
      type,
      location: { address, city, state, country: country || 'India', zipCode },
      features: {
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        area: parseInt(area) || 0,
        parking: parking === 'true',
        furnished: furnished === 'true',
        yearBuilt: parseInt(yearBuilt) || undefined
      },
      amenities: amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',')) : [],
      images,
      owner: req.user._id
    });

    await property.populate('owner', 'name email phone');

    res.status(201).json({ success: true, message: 'Property created successfully', property });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership (or admin)
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
    }

    const {
      title, description, price, priceType, type, status,
      address, city, state, country, zipCode,
      bedrooms, bathrooms, area, parking, furnished, yearBuilt,
      amenities, existingImages
    } = req.body;

    // Handle images: keep existing + add new uploads
    let images = [];
    if (existingImages) {
      images = Array.isArray(existingImages)
        ? existingImages.map((img) => JSON.parse(img))
        : [JSON.parse(existingImages)];
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
      images = [...images, ...newImages];
    }

    const updateData = {
      title, description, price: parseFloat(price), priceType, type, status,
      location: { address, city, state, country: country || 'India', zipCode },
      features: {
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        area: parseInt(area) || 0,
        parking: parking === 'true',
        furnished: furnished === 'true',
        yearBuilt: parseInt(yearBuilt) || undefined
      },
      amenities: amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',')) : [],
    };

    if (images.length > 0) updateData.images = images;

    property = await Property.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    }).populate('owner', 'name email phone');

    res.json({ success: true, message: 'Property updated successfully', property });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete images from Cloudinary
    for (const image of property.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get properties by current user
// @route   GET /api/properties/my-properties
// @access  Private
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort('-createdAt');
    res.json({ success: true, count: properties.length, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, status: 'available' })
      .populate('owner', 'name email')
      .limit(6)
      .sort('-createdAt');
    res.json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProperties, getProperty, createProperty,
  updateProperty, deleteProperty, getMyProperties, getFeaturedProperties
};
