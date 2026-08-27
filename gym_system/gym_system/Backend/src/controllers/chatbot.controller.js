import { askChatbot } from "../services/chatbot.service.js";

const query = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !String(question).trim()) {
      return res
        .status(400)
        .json({ status: "fail", message: "Question is required" });
    }

    const answer = await askChatbot(String(question).trim());
    res.status(200).json({ status: "success", answer });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Chatbot failed to respond. Please try again.",
      ...(process.env.NODE_ENV === "development" && { detail: error.message }),
    });
  }
};

export default { query };
