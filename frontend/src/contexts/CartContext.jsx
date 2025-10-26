import { createContext, useContext, useState, useEffect } from 'react';
import cartAPI from '../api/cart';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await cartAPI.getCart();
        setCart(response.data.cart);
        updateCartCount(response.data.cart);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Update cart count
  const updateCartCount = (cartData) => {
    if (cartData && cartData.items) {
      const count = cartData.items.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1, variant = null) => {
    try {
      const response = await cartAPI.addToCart({
        productId,
        quantity,
        variant,
      });
      setCart(response.data.cart);
      updateCartCount(response.data.cart);
      toast.success('Item added to cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update cart item quantity
  const updateQuantity = async (productId, quantity, variant = null) => {
    try {
      const response = await cartAPI.updateCartItem(productId, quantity, variant);
      setCart(response.data.cart);
      updateCartCount(response.data.cart);
      
      if (quantity === 0) {
        toast.success('Item removed from cart');
      } else {
        toast.success('Cart updated');
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId, variant = null) => {
    try {
      const response = await cartAPI.removeFromCart(productId, variant);
      setCart(response.data.cart);
      updateCartCount(response.data.cart);
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const response = await cartAPI.clearCart();
      setCart(response.data.cart);
      updateCartCount(response.data.cart);
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Apply coupon
  const applyCoupon = async (code, discount, type = 'percentage') => {
    try {
      const response = await cartAPI.applyCoupon({ code, discount, type });
      setCart(response.data.cart);
      toast.success('Coupon applied successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply coupon';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove coupon
  const removeCoupon = async () => {
    try {
      const response = await cartAPI.removeCoupon();
      setCart(response.data.cart);
      toast.success('Coupon removed');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove coupon';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update shipping method
  const updateShippingMethod = async (method) => {
    try {
      const response = await cartAPI.updateShippingMethod(method);
      setCart(response.data.cart);
      toast.success('Shipping method updated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update shipping method';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Validate cart stock
  const validateStock = async () => {
    try {
      const response = await cartAPI.validateStock();
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to validate stock';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Merge guest cart
  const mergeGuestCart = async (guestCart) => {
    try {
      const response = await cartAPI.mergeGuestCart(guestCart);
      setCart(response.data.cart);
      updateCartCount(response.data.cart);
      toast.success('Guest cart merged successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to merge guest cart';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get cart total
  const getCartTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const itemPrice = item.product?.price || 0;
      const variantAdjustment = item.variant?.priceAdjustment || 0;
      return total + ((itemPrice + variantAdjustment) * item.quantity);
    }, 0);
  };

  // Check if item is in cart
  const isInCart = (productId, variant = null) => {
    if (!cart || !cart.items) return false;
    
    return cart.items.some(item => {
      const productMatch = item.product?._id === productId;
      const variantMatch = JSON.stringify(item.variant) === JSON.stringify(variant);
      return productMatch && (variant ? variantMatch : true);
    });
  };

  // Get cart item quantity
  const getItemQuantity = (productId, variant = null) => {
    if (!cart || !cart.items) return 0;
    
    const item = cart.items.find(item => {
      const productMatch = item.product?._id === productId;
      const variantMatch = JSON.stringify(item.variant) === JSON.stringify(variant);
      return productMatch && (variant ? variantMatch : true);
    });
    
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    loading,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    updateShippingMethod,
    validateStock,
    mergeGuestCart,
    getCartTotal,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};