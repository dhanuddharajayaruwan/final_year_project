import { axiosPrivate } from '../utils/axios';

const API_URL = 'body-info';

const getMyBodyInfo = async () => {
  const response = await axiosPrivate.get(`${API_URL}/me`);
  return response.data;
};

const updateMyBodyInfo = async (data) => {
  const response = await axiosPrivate.patch(`${API_URL}/me`, data);
  return response.data;
};

const createMyBodyInfo = async (data) => {
  const response = await axiosPrivate.post(`${API_URL}/`, data);
  return response.data;
};

const bodyInfoService = {
  getMyBodyInfo,
  updateMyBodyInfo,
  createMyBodyInfo
};

export default bodyInfoService;
