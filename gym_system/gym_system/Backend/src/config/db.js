import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/gym_system";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// ── Connection event listeners ─────────────────────────────────────────────────

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected.");
});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB error: ${err.message}`);
});

// ── Graceful shutdown ──────────────────────────────────────────────────────────

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Closing MongoDB connection…`);
  await mongoose.connection.close();
  console.log("MongoDB connection closed. Exiting.");
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default connectDB;
