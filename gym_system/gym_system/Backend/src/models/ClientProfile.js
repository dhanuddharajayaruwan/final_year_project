import mongoose from "mongoose";
import { ACTIVITY_LEVEL_ENUM, MEMBERSHIP_STATUS_ENUM } from "../enums/index.js";

const clientProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    activity_level: {
      type: String,
      enum: ACTIVITY_LEVEL_ENUM,
      default: "beginner",
    },
    medical_notes: {
      type: String,
      trim: true,
      default: null,
    },
    membership_status: {
      type: String,
      enum: MEMBERSHIP_STATUS_ENUM,
      default: "active",
    },
  },
  { timestamps: true }
);

const ClientProfile = mongoose.model("ClientProfile", clientProfileSchema);

export default ClientProfile;
