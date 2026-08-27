import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainerProfile",
      required: true,
    },
    schedule_type: {
      type: String,
      enum: ["personal_training", "group_class", "online_session", "assessment"],
      required: [true, "Schedule type is required"],
    },
    update_date: {
      type: Date,
      default: Date.now,
    },
    expire_date: {
      type: Date,
      required: [true, "Expire date is required"],
    },
    workout_plan: {
      type: String,
      default: null,
    },
    diet_plan: {
      type: String,
      default: null,
    },
    completion_status: {
      type: String,
      enum: ["not_complete", "half_complete", "complete"],
      default: "not_complete",
    },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
