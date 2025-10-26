import express from 'express';
import { body } from 'express-validator';
import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, validationErrorHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate({
      path: 'items.product',
      select: 'name price images ratings category',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id });
    wishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'items.product',
        select: 'name price images ratings category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      });
  }

  res.status(200).json({
    success: true,
    data: { wishlist }
  });
}));

// @desc    Add item to wishlist
// @route   POST /api/wishlist/items
// @access  Private
router.post('/items', [
  protect,
  body('productId')
    .isMongoId()
    .withMessage('Please provide a valid product ID'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { productId, notes, priority } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id });
  }

  // Add item to wishlist
  await wishlist.addItem(productId, notes, priority);

  // Populate wishlist with product details
  wishlist = await Wishlist.findById(wishlist._id)
    .populate({
      path: 'items.product',
      select: 'name price images ratings category',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

  res.status(201).json({
    success: true,
    message: 'Item added to wishlist successfully',
    data: { wishlist }
  });
}));

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/items/:productId
// @access  Private
router.delete('/items/:productId', protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  await wishlist.removeItem(productId);

  // Populate wishlist with product details
  wishlist = await Wishlist.findById(wishlist._id)
    .populate({
      path: 'items.product',
      select: 'name price images ratings category',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

  res.status(200).json({
    success: true,
    message: 'Item removed from wishlist successfully',
    data: { wishlist }
  });
}));

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
router.delete('/', protect, asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  await wishlist.clear();

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared successfully',
    data: { wishlist }
  });
}));

// @desc    Update wishlist item
// @route   PUT /api/wishlist/items/:productId
// @access  Private
router.put('/items/:productId', [
  protect,
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { notes, priority } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  const item = wishlist.items.find(item => item.product.toString() === productId);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in wishlist'
    });
  }

  if (notes !== undefined) item.notes = notes;
  if (priority !== undefined) item.priority = priority;

  await wishlist.save();

  // Populate wishlist with product details
  wishlist = await Wishlist.findById(wishlist._id)
    .populate({
      path: 'items.product',
      select: 'name price images ratings category',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

  res.status(200).json({
    success: true,
    message: 'Wishlist item updated successfully',
    data: { wishlist }
  });
}));

// @desc    Check if item is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
router.get('/check/:productId', protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(200).json({
      success: true,
      data: { isInWishlist: false }
    });
  }

  const isInWishlist = wishlist.hasItem(productId);

  res.status(200).json({
    success: true,
    data: { isInWishlist }
  });
}));

// @desc    Move item to cart
// @route   POST /api/wishlist/move-to-cart/:productId
// @access  Private
router.post('/move-to-cart/:productId', [
  protect,
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1, variant } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  // Move item from wishlist
  const item = await wishlist.moveToCart(productId);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in wishlist'
    });
  }

  // Add to cart
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id });
  }

  await cart.addItem(productId, quantity, variant || item.variant);

  // Populate both wishlist and cart
  wishlist = await Wishlist.findById(wishlist._id)
    .populate({
      path: 'items.product',
      select: 'name price images ratings category',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

  cart = await Cart.findById(cart._id)
    .populate({
      path: 'items.product',
      select: 'name price images inventory.trackQuantity inventory.quantity inventory.allowBackorders',
      populate: {
        path: 'category',
        select: 'name'
      }
    });

  res.status(200).json({
    success: true,
    message: 'Item moved to cart successfully',
    data: { wishlist, cart }
  });
}));

// @desc    Get wishlist by share token
// @route   GET /api/wishlist/shared/:token
// @access  Public
router.get('/shared/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const wishlist = await Wishlist.findByShareToken(token)
    .populate({
      path: 'items.product',
      select: 'name price images ratings category',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Shared wishlist not found or no longer available'
    });
  }

  res.status(200).json({
    success: true,
    data: { wishlist }
  });
}));

// @desc    Generate share token
// @route   POST /api/wishlist/share
// @access  Private
router.post('/share', protect, asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  // Make wishlist public
  wishlist.isPublic = true;
  const token = await wishlist.generateShareToken();

  const shareUrl = wishlist.getShareUrl();

  res.status(200).json({
    success: true,
    message: 'Wishlist sharing enabled',
    data: {
      token,
      shareUrl,
      isPublic: wishlist.isPublic
    }
  });
}));

// @desc    Revoke share token
// @route   DELETE /api/wishlist/share
// @access  Private
router.delete('/share', protect, asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  wishlist.isPublic = false;
  await wishlist.revokeShareToken();

  res.status(200).json({
    success: true,
    message: 'Wishlist sharing disabled'
  });
}));

// @desc    Update wishlist settings
// @route   PUT /api/wishlist/settings
// @access  Private
router.put('/settings', [
  protect,
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Wishlist name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  if (name !== undefined) wishlist.name = name;
  if (description !== undefined) wishlist.description = description;

  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist settings updated successfully',
    data: { wishlist }
  });
}));

// @desc    Get wishlist items by priority
// @route   GET /api/wishlist/priority/:priority
// @access  Private
router.get('/priority/:priority', protect, asyncHandler(async (req, res) => {
  const { priority } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  const items = wishlist.getItemsByPriority(priority);

  // Populate items with product details
  await Wishlist.populate(items, {
    path: 'product',
    select: 'name price images ratings category',
    populate: {
      path: 'category',
      select: 'name slug'
    }
  });

  res.status(200).json({
    success: true,
    data: { items }
  });
}));

export default router;