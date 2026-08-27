import { axiosPrivate } from '../utils/axios';

const API_URL = 'shipping';

const getAllShippings = async (params = {}) => {
  const response = await axiosPrivate.get(API_URL, { params });
  return response.data;
};

const getShippingByOrderId = async (orderId) => {
  const response = await axiosPrivate.get(`${API_URL}/order/${orderId}`);
  return response.data;
};

const updateShipping = async (id, shippingData) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}`, shippingData);
  return response.data;
};

const addShippingLog = async (id, logData) => {
  const response = await axiosPrivate.post(`${API_URL}/${id}/logs`, logData);
  return response.data;
};

export default {
  getAllShippings,
  getShippingByOrderId,
  updateShipping,
  addShippingLog,
};
