const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('category').optional().isIn(['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Vehicles', 'Other']).withMessage('Invalid category'),
  query('condition').optional().isIn(['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition'),
  query('sortBy').optional().isIn(['newest', 'oldest', 'price-low', 'price-high', 'popular']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 12,
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sortBy = 'newest'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (condition) {
      filter.condition = condition;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'popular':
        sort = { views: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .populate('seller', 'fullName rating reviewCount')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'fullName email phone location rating reviewCount createdAt');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('category').isIn(['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Vehicles', 'Other']).withMessage('Invalid category'),
  body('condition').isIn(['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('deliveryOptions').optional().isArray().withMessage('Delivery options must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = {
      ...req.body,
      seller: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    // Populate seller info
    await product.populate('seller', 'fullName rating reviewCount');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('category').optional().isIn(['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Vehicles', 'Other']).withMessage('Invalid category'),
  body('condition').optional().isIn(['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition'),
  body('status').optional().isIn(['active', 'sold', 'pending', 'inactive']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'fullName rating reviewCount');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
});

// @route   GET /api/products/user/:userId
// @desc    Get products by user ID
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const products = await Product.find({ 
      seller: req.params.userId,
      status: { $in: ['active', 'sold'] }
    })
    .populate('seller', 'fullName rating reviewCount')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Get user products error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user products'
    });
  }
});

// @route   POST /api/products/:id/favorite
// @desc    Add product to user's favorites
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if already favorited
    if (product.favorites.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in favorites'
      });
    }

    // Add to favorites
    product.favorites.push(req.user._id);
    await product.save();

    res.json({
      success: true,
      message: 'Product added to favorites'
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while adding to favorites'
    });
  }
});

// @route   DELETE /api/products/:id/favorite
// @desc    Remove product from user's favorites
// @access  Private
router.delete('/:id/favorite', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if not in favorites
    if (!product.favorites.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Product not in favorites'
      });
    }

    // Remove from favorites
    product.favorites = product.favorites.filter(
      userId => userId.toString() !== req.user._id.toString()
    );
    await product.save();

    res.json({
      success: true,
      message: 'Product removed from favorites'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while removing from favorites'
    });
  }
});

// @route   GET /api/products/favorites/user
// @desc    Get user's favorite products
// @access  Private
router.get('/favorites/user', auth, async (req, res) => {
  try {
    const products = await Product.find({
      favorites: req.user._id,
      status: 'active'
    })
    .populate('seller', 'fullName rating reviewCount')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching favorites'
    });
  }
});

module.exports = router;