import { axiosPrivate } from '../utils/axios';

const API_URL = 'chats';

const getRooms = async () => {
  const response = await axiosPrivate.get(`${API_URL}/rooms`);
  return response.data;
};

const createRoom = async (trainerId) => {
  const response = await axiosPrivate.post(`${API_URL}/rooms`, { trainer_id: trainerId });
  return response.data;
};

const getMessages = async (roomId) => {
  const response = await axiosPrivate.get(`${API_URL}/rooms/${roomId}/messages`);
  return response.data;
};

const sendMessage = async (roomId, message) => {
  const response = await axiosPrivate.post(`${API_URL}/rooms/${roomId}/messages`, { message });
  return response.data;
};

export default {
  getRooms,
  createRoom,
  getMessages,
  sendMessage,
};
