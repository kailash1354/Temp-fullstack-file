import express from 'express';
import { body } from 'express-validator';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler, validationErrorHandler } from '../middleware/errorHandler.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// @desc    Create order
// @route   POST /api/orders
// @access  Private
router.post('/', [
  protect,
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('paymentInfo.method')
    .isIn(['card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, paymentInfo, shippingMethod, notes, isGift, giftMessage, giftWrap } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id })
    .populate({
      path: 'items.product',
      select: 'name price images inventory.trackQuantity inventory.quantity inventory.allowBackorders'
    });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Validate stock for all items
  const stockValidation = await cart.validateStock();
  if (!stockValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Some items are out of stock',
      data: { issues: stockValidation.issues }
    });
  }

  // Create order items
  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images[0]?.url || '',
    price: item.product.price,
    quantity: item.quantity,
    variant: item.variant || null,
    totalPrice: (item.product.price + (item.variant?.priceAdjustment || 0)) * item.quantity
  }));

  // Calculate totals
  const subtotal = orderItems.reduce((total, item) => total + item.totalPrice, 0);
  
  // Calculate tax (simplified - 8% in this example)
  const tax = subtotal * 0.08;
  
  // Calculate shipping cost
  const shippingRates = {
    standard: 5.99,
    express: 12.99,
    overnight: 24.99
  };
  const shippingCost = shippingRates[shippingMethod || cart.shippingMethod] || 5.99;

  // Apply coupon discount if exists
  let discount = 0;
  if (cart.coupon) {
    if (cart.coupon.type === 'percentage') {
      discount = (subtotal * cart.coupon.discount) / 100;
    } else {
      discount = cart.coupon.discount;
    }
  }

  const total = subtotal + tax + shippingCost - discount;

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentInfo: {
      method: paymentInfo.method,
      transactionId: paymentInfo.transactionId || null,
      lastFour: paymentInfo.lastFour || null,
      brand: paymentInfo.brand || null
    },
    shippingMethod: shippingMethod || cart.shippingMethod,
    subtotal,
    tax,
    shippingCost,
    discount,
    total,
    notes,
    isGift: isGift || false,
    giftMessage: giftMessage || null,
    giftWrap: giftWrap || false
  });

  // Update product inventory
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (product && product.inventory.trackQuantity) {
      product.updateStock(item.quantity, 'decrease');
      await product.save();
    }
  }

  // Clear cart
  await cart.clear();

  // Send order confirmation email
  try {
    const user = req.user;
    await sendEmail({
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      template: 'order-confirmation',
      data: {
        firstName: user.firstName,
        orderNumber: order.orderNumber,
        total: order.total.toFixed(2),
        estimatedDelivery: order.estimatedDelivery.toDateString()
      }
    });
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError);
  }

  // Populate order with product details
  const populatedOrder = await Order.findById(order._id)
    .populate({
      path: 'items.product',
      select: 'name images'
    })
    .populate('user', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order: populatedOrder }
  });
}));

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const query = { user: req.user.id };
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate({
      path: 'items.product',
      select: 'name images'
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: 'items.product',
      select: 'name images'
    })
    .populate('user', 'firstName lastName email');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user owns this order or is admin
  if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this order'
    });
  }

  res.status(200).json({
    success: true,
    data: { order }
  });
}));

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', [
  protect,
  authorize('admin'),
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status'),
  body('trackingNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tracking number is required for shipped orders'),
  validationErrorHandler
], asyncHandler(async (req, res) => {
  const { status, trackingNumber, notes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Update status
  await order.updateStatus(status);

  // Add tracking number if provided
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  // Add admin notes
  if (notes) {
    order.notes = notes;
  }

  await order.save();

  // Send shipping notification
  if (status === 'shipped' && trackingNumber) {
    try {
      await sendEmail({
        to: order.user.email,
        subject: `Your Order Has Shipped - ${order.orderNumber}`,
        template: 'shipping-notification',
        data: {
          firstName: order.user.firstName,
          orderNumber: order.orderNumber,
          trackingNumber: trackingNumber,
          carrier: 'FedEx' // Default carrier
        }
      });
    } catch (emailError) {
      console.error('Failed to send shipping notification:', emailError);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
}));

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user owns this order
  if (order.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this order'
    });
  }

  // Check if order can be cancelled
  if (!order.canBeCancelled()) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be cancelled at this stage'
    });
  }

  // Update status
  await order.updateStatus('cancelled');

  // Restore inventory
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product && product.inventory.trackQuantity) {
      product.updateStock(item.quantity, 'increase');
      await product.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order }
  });
}));

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  const search = req.query.search || '';

  const query = {};
  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'user.firstName': { $regex: search, $options: 'i' } },
      { 'user.lastName': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } }
    ];
  }

  const orders = await Order.find(query)
    .populate('user', 'firstName lastName email')
    .populate({
      path: 'items.product',
      select: 'name images'
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const dateRange = req.query.dateRange || '30'; // days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(dateRange));

  const stats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        confirmedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get daily sales data for the last 30 days
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ['cancelled'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      },
      dailySales
    }
  });
}));

export default router;