import mongoose from "mongoose";

const trainerProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      default: null,
    },
    certifications: {
      type: [String],
      default: [],
    },
    available_to: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const TrainerProfile = mongoose.model("TrainerProfile", trainerProfileSchema);

export default TrainerProfile;
