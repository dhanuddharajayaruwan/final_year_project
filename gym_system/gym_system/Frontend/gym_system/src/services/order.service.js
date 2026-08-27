import { axiosPrivate, axiosInstance } from '../utils/axios';

const API_URL = 'orders';

const createOrder = async (payload) => {
  // Use axiosInstance so guests (no token) can also create orders
  const token = localStorage.getItem('token');
  const instance = token ? axiosPrivate : axiosInstance;
  const response = await instance.post(API_URL, payload);
  return response.data;
};

const getOrderById = async (id) => {
  // Send auth token if logged in so the backend can verify ownership
  const token = localStorage.getItem('token');
  const instance = token ? axiosPrivate : axiosInstance;
  const response = await instance.get(`${API_URL}/${id}`);
  return response.data;
};

const getAllOrders = async (params = {}) => {
  const response = await axiosPrivate.get(API_URL, { params });
  return response.data;
};

const getMyOrders = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/me`, { params });
  return response.data;
};

const updateOrderStatus = async (id, status) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}/status`, { order_status: status });
  return response.data;
};

export default {
  createOrder,
  getOrderById,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
};
