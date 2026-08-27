import { axiosPrivate } from '../utils/axios';

const API_URL = 'cart';

const getMyCart = async () => {
  const response = await axiosPrivate.get(API_URL);
  return response.data;
};

const addItemToCart = async (product_id, quantity = 1) => {
  const response = await axiosPrivate.post(`${API_URL}/items`, {
    product_id,
    quantity,
  });
  return response.data;
};

const updateCartItem = async (itemId, quantity) => {
  const response = await axiosPrivate.patch(`${API_URL}/items/${itemId}`, {
    quantity,
  });
  return response.data;
};

const removeCartItem = async (itemId) => {
  const response = await axiosPrivate.delete(`${API_URL}/items/${itemId}`);
  return response.data;
};

const clearCart = async () => {
  const response = await axiosPrivate.delete(API_URL);
  return response.data;
};

export default {
  getMyCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
