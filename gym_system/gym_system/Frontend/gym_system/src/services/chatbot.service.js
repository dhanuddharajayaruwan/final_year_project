import { axiosInstance } from "../utils/axios";

const queryChatbot = async (question) => {
  const response = await axiosInstance.post("chatbot/query", { question });
  return response.data; // { status: 'success', answer: '...' }
};

const chatbotService = {
  queryChatbot,
};

export default chatbotService;
