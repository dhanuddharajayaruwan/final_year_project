import { axiosPrivate } from "../utils/axios";

const API_URL = "schedules";

const getMySchedules = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/me`, {
    params: { limit: 500, ...params },
  });
  return response.data;
};

const createSchedule = async (scheduleData) => {
  const response = await axiosPrivate.post(API_URL, scheduleData);
  return response.data;
};

const updateSchedule = async (id, scheduleData) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}`, scheduleData);
  return response.data;
};

const deleteSchedule = async (id) => {
  const response = await axiosPrivate.delete(`${API_URL}/${id}`);
  return response.data;
};

const updateCompletion = async (id, completion_status) => {
  const response = await axiosPrivate.patch(`${API_URL}/${id}/completion`, { completion_status });
  return response.data;
};

export default {
  getMySchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateCompletion,
};
