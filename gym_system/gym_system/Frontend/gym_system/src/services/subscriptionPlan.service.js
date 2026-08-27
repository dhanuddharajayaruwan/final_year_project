import { axiosPrivate } from '../utils/axios';

const API_URL = 'subscription-plans';

const getAllPlans = async (params = {}) => {
  const response = await axiosPrivate.get(API_URL, { params });
  return response.data;
};

const getPlanById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/${id}`);
  return response.data;
};

const createPlan = async (planData) => {
  const response = await axiosPrivate.post(API_URL, planData);
  return response.data;
};

const updatePlan = async (id, planData) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}`, planData);
  return response.data;
};

const deletePlan = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

export default {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
