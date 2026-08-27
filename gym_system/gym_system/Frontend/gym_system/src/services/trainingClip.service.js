import { axiosPrivate, axiosInstance } from '../utils/axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = 'training-clips';

const getAllClips = async (params = {}) => {
  const response = await axiosInstance.get(API_URL, {
    params
  });
  return response.data;
};

const getMyClips = async () => {
  const response = await axiosPrivate.get(`${API_URL}/me/list`);
  return response.data;
};

const getCoachClips = async (trainerId) => {
  const response = await axiosPrivate.get(`${API_URL}/coach/${trainerId}`);
  return response.data;
};

const createClip = async (clipData) => {
  const headers = clipData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await axiosPrivate.post(API_URL, clipData, { headers });
  return response.data;
};

const updateClip = async (id, clipData) => {
  const headers = clipData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await axiosPrivate.patch(`${API_URL}/${id}`, clipData, { headers });
  return response.data;
};

const deleteClip = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

export default {
  getAllClips,
  getMyClips,
  getCoachClips,
  createClip,
  updateClip,
  deleteClip,
  BASE_URL
};
