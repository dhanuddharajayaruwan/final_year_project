import { axiosPrivate } from '../utils/axios';

const API_URL = 'delivery-fees';

const getAllFees = async (params = {}) => {
  const response = await axiosPrivate.get(API_URL, { params });
  return response.data;
};

const getFeeById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/${id}`);
  return response.data;
};

const createFee = async (feeData) => {
  const response = await axiosPrivate.post(API_URL, feeData);
  return response.data;
};

const updateFee = async (id, feeData) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}`, feeData);
  return response.data;
};

const deleteFee = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

export default {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
};
