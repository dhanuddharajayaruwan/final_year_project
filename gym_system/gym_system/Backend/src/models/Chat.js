import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainerProfile",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// One chat room per trainer-user pair
chatSchema.index({ trainer_id: 1, user_id: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
