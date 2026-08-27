import { axiosPrivate } from '../utils/axios';

const API_URL = 'categories';

const getAllCategories = async () => {
  const response = await axiosPrivate.get(API_URL);
  return response.data;
};

const getCategoryById = async (id) => {
  const response = await axiosPrivate.get(`${API_URL}/${id}`);
  return response.data;
};

const createCategory = async (categoryData) => {
  const response = await axiosPrivate.post(API_URL, categoryData);
  return response.data;
};

const updateCategory = async (id, categoryData) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}`, categoryData);
  return response.data;
};

const deleteCategory = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
