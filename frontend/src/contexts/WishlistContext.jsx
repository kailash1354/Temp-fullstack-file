import { createContext, useContext, useState, useEffect } from 'react';
import wishlistAPI from '../api/wishlist';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load wishlist on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const response = await wishlistAPI.getWishlist();
        setWishlist(response.data.wishlist);
        updateWishlistCount(response.data.wishlist);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // Update wishlist count
  const updateWishlistCount = (wishlistData) => {
    if (wishlistData && wishlistData.items) {
      setWishlistCount(wishlistData.items.length);
    } else {
      setWishlistCount(0);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId, notes = '', priority = 'medium') => {
    try {
      const response = await wishlistAPI.addToWishlist({
        productId,
        notes,
        priority,
      });
      setWishlist(response.data.wishlist);
      updateWishlistCount(response.data.wishlist);
      toast.success('Item added to wishlist');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to wishlist';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.removeFromWishlist(productId);
      setWishlist(response.data.wishlist);
      updateWishlistCount(response.data.wishlist);
      toast.success('Item removed from wishlist');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item from wishlist';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      const response = await wishlistAPI.clearWishlist();
      setWishlist(response.data.wishlist);
      updateWishlistCount(response.data.wishlist);
      toast.success('Wishlist cleared');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear wishlist';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update wishlist item
  const updateWishlistItem = async (productId, itemData) => {
    try {
      const response = await wishlistAPI.updateWishlistItem(productId, itemData);
      setWishlist(response.data.wishlist);
      toast.success('Wishlist item updated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update wishlist item';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Check if item is in wishlist
  const checkInWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.checkInWishlist(productId);
      return response.data.isInWishlist;
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
      return false;
    }
  };

  // Move item to cart
  const moveToCart = async (productId, quantity = 1, variant = null) => {
    try {
      const response = await wishlistAPI.moveToCart(productId, quantity, variant);
      setWishlist(response.data.wishlist);
      updateWishlistCount(response.data.wishlist);
      toast.success('Item moved to cart');
      return { success: true, cart: response.data.cart };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to move item to cart';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Generate share token
  const generateShareToken = async () => {
    try {
      const response = await wishlistAPI.generateShareToken();
      setWishlist(prev => ({ ...prev, ...response.data }));
      toast.success('Wishlist sharing enabled');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate share token';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Revoke share token
  const revokeShareToken = async () => {
    try {
      await wishlistAPI.revokeShareToken();
      setWishlist(prev => ({ 
        ...prev, 
        shareToken: null,
        isPublic: false 
      }));
      toast.success('Wishlist sharing disabled');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to revoke share token';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update wishlist settings
  const updateSettings = async (settings) => {
    try {
      const response = await wishlistAPI.updateSettings(settings);
      setWishlist(response.data.wishlist);
      toast.success('Wishlist settings updated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update wishlist settings';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get items by priority
  const getItemsByPriority = async (priority) => {
    try {
      const response = await wishlistAPI.getItemsByPriority(priority);
      return response.data.items;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get items by priority';
      toast.error(message);
      return [];
    }
  };

  // Get shared wishlist
  const getSharedWishlist = async (token) => {
    try {
      const response = await wishlistAPI.getSharedWishlist(token);
      return response.data.wishlist;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get shared wishlist';
      toast.error(message);
      return null;
    }
  };

  // Check if item is in wishlist (local check)
  const isInWishlist = (productId) => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some(item => item.product?._id === productId);
  };

  // Get wishlist item
  const getWishlistItem = (productId) => {
    if (!wishlist || !wishlist.items) return null;
    return wishlist.items.find(item => item.product?._id === productId);
  };

  // Get share URL
  const getShareUrl = () => {
    if (!wishlist || !wishlist.shareToken) return null;
    return `${window.location.origin}/wishlist/shared/${wishlist.shareToken}`;
  };

  const value = {
    wishlist,
    loading,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    updateWishlistItem,
    checkInWishlist,
    moveToCart,
    generateShareToken,
    revokeShareToken,
    updateSettings,
    getItemsByPriority,
    getSharedWishlist,
    isInWishlist,
    getWishlistItem,
    getShareUrl,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};