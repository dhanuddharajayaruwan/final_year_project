import Chat from "../models/Chat.js";
import ChatMessage from "../models/ChatMessage.js";
import TrainerProfile from "../models/TrainerProfile.js";
import User from "../models/User.js";

const fail = (msg, code = 400) => {
  const e = new Error(msg);
  e.statusCode = code;
  throw e;
};

export const getOrCreateChatRoom = async (trainerId, clientId) => {
  const trainer = await TrainerProfile.findById(trainerId);
  if (!trainer) fail("Trainer profile not found.", 404);

  const client = await User.findById(clientId);
  if (!client) fail("Client user not found.", 404);

  let chat = await Chat.findOne({ trainer_id: trainerId, user_id: clientId });
  if (!chat) {
    chat = await Chat.create({ trainer_id: trainerId, user_id: clientId });
  }
  return chat;
};

export const getChatRoomsForUser = async (userId, role) => {
  let filter = {};
  if (role === "client") {
    filter.user_id = userId;
  } else if (role === "trainer") {
    const trainer = await TrainerProfile.findOne({ user_id: userId });
    if (!trainer) return [];
    filter.trainer_id = trainer._id;
  } else if (role === "admin") {
    filter = {};
  } else {
    return [];
  }

  const rooms = await Chat.find(filter)
    .populate({
      path: "trainer_id",
      populate: { path: "user_id", select: "name email profile_image" },
    })
    .populate("user_id", "name email profile_image")
    .sort({ updatedAt: -1 });

  return rooms;
};

export const getChatMessages = async (chatId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) fail("Chat room not found.", 404);

  const messages = await ChatMessage.find({ chat_id: chatId })
    .sort({ time: 1 })
    .populate("sender_id", "name email profile_image role");

  return messages;
};

export const createChatMessage = async (chatId, senderId, messageText) => {
  const chat = await Chat.findById(chatId);
  if (!chat) fail("Chat room not found.", 404);

  const chatMessage = await ChatMessage.create({
    chat_id: chatId,
    sender_id: senderId,
    message: messageText,
    time: new Date(),
  });

  chat.updatedAt = new Date();
  await chat.save();

  return ChatMessage.findById(chatMessage._id).populate(
    "sender_id",
    "name email profile_image role"
  );
};
