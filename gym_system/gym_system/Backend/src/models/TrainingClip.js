import mongoose from "mongoose";

const trainingClipSchema = new mongoose.Schema(
  {
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainerProfile",
      required: true,
    },
    clip: {
      type: String, // file path or URL to the video clip
      required: [true, "Clip URL/path is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

const TrainingClip = mongoose.model("TrainingClip", trainingClipSchema);

export default TrainingClip;
