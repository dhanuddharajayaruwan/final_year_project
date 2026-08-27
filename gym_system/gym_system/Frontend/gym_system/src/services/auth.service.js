import { axiosInstance, axiosPrivate } from '../utils/axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = 'auth'; // using base URL from axios instance

const login = async (email, password) => {
  const response = await axiosInstance.post(`${API_URL}/login`, {
    email,
    password,
  });
  if (response.data.token) localStorage.setItem('token', response.data.token);
  if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data;
};

const register = async (name, email, password, role, termsAccepted = false) => {
  const response = await axiosInstance.post(`${API_URL}/register`, {
    name,
    email,
    password,
    role,
    terms_accepted: termsAccepted,
  });
  if (response.data.token) localStorage.setItem('token', response.data.token);
  if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data;
};

const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  try {
    await axiosInstance.post(`${API_URL}/logout`);
  } catch (error) {
    console.error("Logout error", error);
  }
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr || userStr === 'undefined') return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const getMe = async () => {
  const response = await axiosPrivate.get(`${API_URL}/me`);
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await axiosPrivate.patch(`${API_URL}/me`, profileData);
  return response.data;
};

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axiosPrivate.post(`${API_URL}/me/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

const sendOtp = async (email) => {
  const response = await axiosInstance.post(`${API_URL}/send-otp`, { email });
  return response.data;
};

const verifyOtp = async (email, otp) => {
  const response = await axiosInstance.post(`${API_URL}/verify-otp`, { email, otp });
  return response.data;
};

const resendOtp = async (email) => {
  const response = await axiosInstance.post(`${API_URL}/resend-otp`, { email });
  return response.data;
};

const resetPasswordWithOtp = async (email, password, confirmPassword) => {
  const response = await axiosInstance.post(`${API_URL}/reset-password-otp`, {
    email,
    password,
    confirmPassword,
  });
  return response.data;
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getMe,
  updateProfile,
  uploadImage,
  getImageUrl,
  sendOtp,
  verifyOtp,
  resendOtp,
  resetPasswordWithOtp,
};

export default authService;
