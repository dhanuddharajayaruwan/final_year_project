import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@gmail.com" });
    if (adminExists) {
      console.log("Admin user already exists. Skipping seed.");
    } else {
      // Create admin user
      const admin = new User({
        name: "admin",
        email: "admin@gmail.com",
        password: "admin@123",
        role: "admin",
      });

      await admin.save();
      console.log("Admin user created successfully!");
      console.log("Email: admin@gmail.com");
      console.log("Password: admin@123");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
