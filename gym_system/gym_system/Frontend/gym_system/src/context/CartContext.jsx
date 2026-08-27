/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import cartService from '../services/cart.service';
import { AuthContext } from './AuthContext';
import { showError, showWarning, showSuccess } from '../utils/sweetAlerts';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user || (user.role !== 'client' && user.role !== 'trainer')) return;
    try {
      setLoading(true);
      const data = await cartService.getMyCart();
      if (data.status === 'success') {
        setCart(data.cart);
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user || (user.role !== 'client' && user.role !== 'trainer')) {
      showWarning("Authentication Required", "Please login to add items to your cart.");
      return false;
    }
    
    try {
      const data = await cartService.addItemToCart(productId, quantity);
      if (data.status === 'success') {
        setCart(data.cart);
        setCartItems(data.items || []);
        showSuccess("Added to Cart", "Product added successfully!");
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add item to cart';
      showError("Cart Error", msg);
      return false;
    }
    return false;
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return removeCartItem(itemId);
    try {
      const data = await cartService.updateCartItem(itemId, quantity);
      if (data.status === 'success') {
        setCart(data.cart);
        setCartItems(data.items || []);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update quantity';
      showError("Update Failed", msg);
    }
  };

  const removeCartItem = async (itemId) => {
    try {
      const data = await cartService.removeCartItem(itemId);
      if (data.status === 'success') {
        setCart(data.cart);
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    try {
      const data = await cartService.clearCart();
      if (data.status === 'success') {
        setCart(null);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // populate returns product_id as an object
      const amount = item.product_id?.amount || 0;
      return total + (amount * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        cartItems, 
        loading, 
        fetchCart, 
        addToCart, 
        updateQuantity, 
        removeCartItem, 
        clearCart,
        getCartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
