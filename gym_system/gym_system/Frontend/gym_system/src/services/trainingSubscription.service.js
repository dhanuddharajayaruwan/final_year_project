import { axiosPrivate } from '../utils/axios';

const API_URL = 'subscriptions';

const getAllSubscriptions = async (params = {}) => {
  const response = await axiosPrivate.get(API_URL, { params });
  return response.data;
};

const getSubscriptionById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/${id}`);
  return response.data;
};

const createSubscription = async (subData) => {
  const response = await axiosPrivate.post(API_URL, subData);
  return response.data;
};

const updateSubscription = async (id, subData) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}`, subData);
  return response.data;
};

const deleteSubscription = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

const getMySubscriptions = async () => {
  const response = await axiosPrivate.get(`${API_URL}/me`);
  return response.data;
};

const initiatePayHere = async (planId) => {
  const response = await axiosPrivate.post(`${API_URL}/payhere/${planId}`);
  return response.data;
};

const initiateBank = async (planId, slipId) => {
  const response = await axiosPrivate.post(`${API_URL}/bank/${planId}`, { slipId });
  return response.data;
};

export default {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getMySubscriptions,
  initiatePayHere,
  initiateBank,
};
