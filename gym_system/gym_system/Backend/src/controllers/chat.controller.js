import * as service from "../services/chat.service.js";

const handle = (res, err) =>
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

export const createOrGetRoom = async (req, res) => {
  try {
    const { trainer_id } = req.body;
    const clientId = req.user._id;
    const chat = await service.getOrCreateChatRoom(trainer_id, clientId);
    res.status(200).json({ status: "success", chat });
  } catch (err) {
    handle(res, err);
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await service.getChatRoomsForUser(req.user._id, req.user.role);
    res.status(200).json({ status: "success", rooms });
  } catch (err) {
    handle(res, err);
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await service.getChatMessages(roomId);
    res.status(200).json({ status: "success", messages });
  } catch (err) {
    handle(res, err);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;
    const chatMessage = await service.createChatMessage(
      roomId,
      req.user._id,
      message
    );
    res.status(201).json({ status: "success", message: chatMessage });
  } catch (err) {
    handle(res, err);
  }
};
