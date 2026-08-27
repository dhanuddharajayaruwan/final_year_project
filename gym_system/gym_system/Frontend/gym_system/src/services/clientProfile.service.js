import { axiosPrivate } from "../utils/axios";

const API_URL = "client-profiles";

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

const getAllProfiles = async () => {
  const response = await axiosPrivate.get(`${API_URL}?limit=1000`);
  return response.data;
};

const getProfileById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/${id}`);
  return response.data;
};

const deleteProfile = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

const registerMember = async (memberData) => {
  const response = await axiosPrivate.post(`${API_URL}/register`, memberData);
  return response.data;
};

export default {
  getMyProfile,
  updateMyProfile,
  createMyProfile,
  getAllProfiles,
  getProfileById,
  deleteProfile,
  registerMember,
};
