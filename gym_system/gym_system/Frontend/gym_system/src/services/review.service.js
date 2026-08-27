import { axiosPrivate, axiosInstance } from "../utils/axios";

const API_URL = "reviews";

const getAllReviews = async (params = {}) => {
  const response = await axiosInstance.get(API_URL, { params });
  return response.data;
};

const createReview = async (reviewData) => {
  // Use public instance for guests (no token), private for logged-in users
  const token = localStorage.getItem("token");
  const instance = token ? axiosPrivate : axiosInstance;
  const response = await instance.post(API_URL, reviewData);
  return response.data;
};

const getReviewByOrder = async (orderId) => {
  const response = await axiosInstance.get(`${API_URL}/order/${orderId}`);
  return response.data;
};

const getProductReviews = async (productId, params = {}) => {
  const response = await axiosInstance.get(`${API_URL}/product/${productId}`, {
    params,
  });
  return response.data;
};

const getProductStats = async (productId) => {
  const response = await axiosInstance.get(`${API_URL}/stats/${productId}`);
  return response.data;
};

const deleteReview = async (id) => {
  const token = localStorage.getItem("token");
  const instance = token ? axiosPrivate : axiosInstance;
  const response = await instance.delete(`${API_URL}/${id}`);
  return response.data;
};

const getGymReviews = async (params = {}) => {
  const response = await axiosInstance.get(`${API_URL}/gym`, { params });
  return response.data;
};

const createGymReview = async (reviewData) => {
  const response = await axiosPrivate.post(`${API_URL}/gym`, reviewData);
  return response.data;
};

const updateReview = async (id, reviewData) => {
  const token = localStorage.getItem("token");
  const instance = token ? axiosPrivate : axiosInstance;
  const response = await instance.patch(`${API_URL}/${id}`, reviewData);
  return response.data;
};

const getMyReviews = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/me`, { params });
  return response.data;
};

export default {
  getAllReviews,
  createReview,
  getReviewByOrder,
  getProductReviews,
  getProductStats,
  deleteReview,
  updateReview,
  getGymReviews,
  createGymReview,
  getMyReviews,
};
