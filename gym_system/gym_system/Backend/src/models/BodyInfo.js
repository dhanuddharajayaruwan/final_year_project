import mongoose from "mongoose";
import { GENDER_ENUM, GOAL_ENUM } from "../enums/index.js";

const bodyInfoSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    height: {
      type: Number, // in cm
      default: null,
    },
    weight: {
      type: Number, // in kg
      default: null,
    },
    gender: {
      type: String,
      enum: GENDER_ENUM,
      default: null,
    },
    goal: {
      type: String,
      enum: GOAL_ENUM,
      default: null,
    },
  },
  { timestamps: true }
);

const BodyInfo = mongoose.model("BodyInfo", bodyInfoSchema);

export default BodyInfo;
