import express from 'express';
import { body } from 'express-validator';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { asyncHandler, validationErrorHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate({
      path: 'items.product',
      select: 'name price images inventory.trackQuantity inventory.quantity inventory.allowBackorders',
      populate: {
        path: 'category',
        select: 'name'
      }
    });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id });
    cart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price images inventory.trackQuantity inventory.quantity inventory.allowBackorders',
        populate: {
          path: 'category',
          select: 'name'
        }
      });
  }

  res.status(200).json({
    success: true,
    data: { cart }
  });
}));

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
router.post('/items', [
  protect,
  body('productId')
    .isMongoId()
    .withMessage('Please provide a valid product ID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { productId, quantity, variant } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if product is active
  if (product.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Product is not available'
    });
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id });
  }

  // Add item to cart
  await cart.addItem(productId, quantity, variant);

  // Populate cart with product details
  cart = await Cart.findById(cart._id)
    .populate({
      path: 'items.product',
      select: 'name price images inventory.trackQuantity inventory.quantity inventory.allowBackorders',
      populate: {
        path: 'category',
        select: 'name'
      }
    });

  res.status(201).json({
    success: true,
    message: 'Item added to cart successfully',
    data: { cart }
  });
}));

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
router.put('/items/:productId', [
  protect,
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, variant } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  await cart.updateQuantity(productId, quantity, variant);

  // Populate cart with product details
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
    message: 'Cart item updated successfully',
    data: { cart }
  });
}));

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
router.delete('/items/:productId', protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variant } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  await cart.removeItem(productId, variant);

  // Populate cart with product details
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
    message: 'Item removed from cart successfully',
    data: { cart }
  });
}));

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  await cart.clear();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: { cart }
  });
}));

// @desc    Apply coupon
// @route   POST /api/cart/coupon
// @access  Private
router.post('/coupon', [
  protect,
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required'),
  body('discount')
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),
  body('type')
    .isIn(['percentage', 'fixed'])
    .withMessage('Coupon type must be percentage or fixed'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { code, discount, type } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  // In a real application, you would validate the coupon code against a Coupon model
  // For now, we'll just apply it directly
  await cart.applyCoupon(code, discount, type);

  // Populate cart with product details
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
    message: 'Coupon applied successfully',
    data: { cart }
  });
}));

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
router.delete('/coupon', protect, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  await cart.removeCoupon();

  // Populate cart with product details
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
    message: 'Coupon removed successfully',
    data: { cart }
  });
}));

// @desc    Update shipping method
// @route   PUT /api/cart/shipping
// @access  Private
router.put('/shipping', [
  protect,
  body('method')
    .isIn(['standard', 'express', 'overnight'])
    .withMessage('Invalid shipping method'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { method } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  cart.shippingMethod = method;
  await cart.save();

  // Populate cart with product details
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
    message: 'Shipping method updated successfully',
    data: { cart }
  });
}));

// @desc    Validate cart stock
// @route   GET /api/cart/validate
// @access  Private
router.get('/validate', protect, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  const stockValidation = await cart.validateStock();

  res.status(200).json({
    success: true,
    data: stockValidation
  });
}));

// @desc    Merge guest cart with user cart
// @route   POST /api/cart/merge
// @access  Private
router.post('/merge', protect, asyncHandler(async (req, res) => {
  const { guestCart } = req.body;

  if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Guest cart data is required'
    });
  }

  let userCart = await Cart.findOne({ user: req.user.id });

  if (!userCart) {
    userCart = await Cart.create({ user: req.user.id });
  }

  // Merge items from guest cart
  for (const guestItem of guestCart.items) {
    await userCart.addItem(guestItem.product, guestItem.quantity, guestItem.variant);
  }

  // Apply guest cart coupon if exists
  if (guestCart.coupon) {
    await userCart.applyCoupon(guestCart.coupon.code, guestCart.coupon.discount, guestCart.coupon.type);
  }

  // Set shipping method from guest cart
  if (guestCart.shippingMethod) {
    userCart.shippingMethod = guestCart.shippingMethod;
  }

  await userCart.save();

  // Populate cart with product details
  userCart = await Cart.findById(userCart._id)
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
    message: 'Carts merged successfully',
    data: { cart: userCart }
  });
}));

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
router.get('/count', protect, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: { count: 0 }
    });
  }

  const count = cart.getItemCount();

  res.status(200).json({
    success: true,
    data: { count }
  });
}));

export default router;