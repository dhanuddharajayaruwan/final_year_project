import { axiosPrivate } from '../utils/axios';

const API_URL = 'trainer-profiles';

const getMyProfile = async () => {
  const response = await axiosPrivate.get(`${API_URL}/me`);
  return response.data;
};

const updateMyProfile = async (profileData) => {
  const response = await axiosPrivate.patch(`${API_URL}/me`, profileData);
  return response.data;
};

const createMyProfile = async (profileData) => {
  const response = await axiosPrivate.post(API_URL, profileData);
  return response.data;
};

const getAllProfiles = async (params = {}) => {
  const response = await axiosPrivate.get(API_URL, { params });
  return response.data;
};

const getProfileById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/${id}`);
  return response.data;
};

const registerTrainer = async (trainerData) => {
  const response = await axiosPrivate.post(`${API_URL}/register`, trainerData);
  return response.data;
};

const updateProfile = async (id, profileData) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}`, profileData);
  return response.data;
};

const deleteProfile = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

export default {
  getMyProfile,
  updateMyProfile,
  createMyProfile,
  getAllProfiles,
  getProfileById,
  registerTrainer,
  updateProfile,
  deleteProfile,
};
