import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryFee from "../models/DeliveryFee.js";
import connectDB from "../config/db.js";

dotenv.config();

const districts = [
  { district: "Colombo", price: 350, minimum_days: 1, maximum_days: 2 },
  { district: "Gampaha", price: 400, minimum_days: 1, maximum_days: 3 },
  { district: "Kalutara", price: 450, minimum_days: 2, maximum_days: 3 },
  { district: "Kandy", price: 500, minimum_days: 2, maximum_days: 4 },
  { district: "Matale", price: 550, minimum_days: 2, maximum_days: 5 },
  { district: "Nuwara Eliya", price: 550, minimum_days: 3, maximum_days: 5 },
  { district: "Galle", price: 500, minimum_days: 2, maximum_days: 4 },
  { district: "Matara", price: 550, minimum_days: 2, maximum_days: 5 },
  { district: "Hambantota", price: 600, minimum_days: 3, maximum_days: 5 },
  { district: "Jaffna", price: 750, minimum_days: 3, maximum_days: 7 },
  { district: "Kilinochchi", price: 700, minimum_days: 3, maximum_days: 6 },
  { district: "Mannar", price: 700, minimum_days: 3, maximum_days: 6 },
  { district: "Vavuniya", price: 650, minimum_days: 3, maximum_days: 5 },
  { district: "Mullaitivu", price: 700, minimum_days: 4, maximum_days: 7 },
  { district: "Batticaloa", price: 600, minimum_days: 3, maximum_days: 6 },
  { district: "Ampara", price: 600, minimum_days: 3, maximum_days: 6 },
  { district: "Trincomalee", price: 650, minimum_days: 3, maximum_days: 6 },
  { district: "Kurunegala", price: 500, minimum_days: 2, maximum_days: 4 },
  { district: "Puttalam", price: 550, minimum_days: 2, maximum_days: 5 },
  { district: "Anuradhapura", price: 550, minimum_days: 2, maximum_days: 5 },
  { district: "Polonnaruwa", price: 600, minimum_days: 3, maximum_days: 5 },
  { district: "Badulla", price: 600, minimum_days: 3, maximum_days: 6 },
  { district: "Moneragala", price: 650, minimum_days: 4, maximum_days: 7 },
  { district: "Ratnapura", price: 550, minimum_days: 2, maximum_days: 5 },
  { district: "Kegalle", price: 500, minimum_days: 2, maximum_days: 4 },
];

const seedDeliveryFees = async () => {
  try {
    await connectDB();

    // Clear existing delivery fees
    await DeliveryFee.deleteMany({});
    console.log("Existing delivery fees cleared.");

    // Insert new delivery fees
    await DeliveryFee.insertMany(districts);
    console.log(`${districts.length} delivery fees seeded successfully.`);

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding delivery fees: ${error.message}`);
    process.exit(1);
  }
};

seedDeliveryFees();
