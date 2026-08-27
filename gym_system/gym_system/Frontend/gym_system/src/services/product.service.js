import { axiosPrivate } from '../utils/axios';

// Keeping BASE_URL for exports if components use it to resolve image URLs
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = 'products';

const getAllProducts = async (params = {}) => {
  const response = await axiosPrivate.get(API_URL, { params });
  return response.data;
};

const getProductById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/${id}`);
  return response.data;
};

const createProduct = async (productData) => {
  const response = await axiosPrivate.post(API_URL, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const updateProduct = async (id, productData) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const deleteProduct = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

export { BASE_URL };
export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
