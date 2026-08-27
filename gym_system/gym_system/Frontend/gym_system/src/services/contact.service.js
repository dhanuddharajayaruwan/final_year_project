import { axiosInstance, axiosPrivate } from "../utils/axios";

const API_URL = "contact";

const sendMessage = async ({ first_name, last_name, email, message }) => {
  const response = await axiosInstance.post(API_URL, {
    first_name,
    last_name,
    email,
    message,
  });
  return response.data;
};

const getAllContacts = async (params = {}) => {
  const response = await axiosPrivate.get(API_URL, { params });
  return response.data;
};

const markRead = async (id) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}/read`);
  return response.data;
};

const deleteContact = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

export default { sendMessage, getAllContacts, markRead, deleteContact };
