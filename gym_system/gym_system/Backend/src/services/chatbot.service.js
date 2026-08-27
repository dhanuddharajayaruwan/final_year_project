import Product from "../models/Product.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import DeliveryFee from "../models/DeliveryFee.js";
import TrainerProfile from "../models/TrainerProfile.js";
import { getGymAnswer } from "../utils/chatbot.js";

/**
 * Fetches all relevant gym data from the DB and builds a context string
 * so Gemini can answer questions accurately.
 */
const buildContext = async () => {
  const [products, plans, fees, trainers] = await Promise.all([
    Product.find({ isAvailable: true }).populate("category_id", "name").lean(),
    SubscriptionPlan.find().lean(),
    DeliveryFee.find().lean(),
    TrainerProfile.find().populate("user_id", "firstName lastName").lean(),
  ]);

  let context =
    "You are a helpful AI assistant for Cylon Force Gym. " +
    "You have access to the gym's current data below. " +
    "Only answer questions that relate to this data (products, subscription plans, delivery fees, trainers). " +
    "For anything outside this scope, politely decline and redirect.\n\n";

  // ── Products ──────────────────────────────────────────────────────────────
  context += "=== PRODUCTS ===\n";
  if (products.length === 0) {
    context += "No products currently available.\n";
  } else {
    products.forEach((p) => {
      context += `- Name: ${p.name} | Price: LKR ${p.amount} | Category: ${
        p.category_id?.name || "Uncategorised"
      } | Stock: ${p.quantity}\n`;
      if (p.description) context += `  Description: ${p.description}\n`;
    });
  }

  // ── Subscription Plans ────────────────────────────────────────────────────
  context += "\n=== SUBSCRIPTION PLANS ===\n";
  if (plans.length === 0) {
    context += "No subscription plans available.\n";
  } else {
    plans.forEach((p) => {
      const durationVal = p.duration || p.duration_days; // Check both common field names
      const durationText = (durationVal && durationVal > 0)
        ? `${durationVal} days`
        : "permanent access";
      context += `- Plan: ${p.name} | Price: LKR ${p.price} | Mode: ${p.type} | Validity: ${durationText}\n`;
      if (p.description) context += `  Description: ${p.description}\n`;
    });
  }

  // ── Delivery Fees ─────────────────────────────────────────────────────────
  context += "\n=== DELIVERY FEES BY DISTRICT ===\n";
  if (fees.length === 0) {
    context += "No delivery fee information available.\n";
  } else {
    fees.forEach((f) => {
      context += `- District: ${f.district} | Fee: LKR ${f.price} | Delivery Time: ${f.minimum_days}–${f.maximum_days} days\n`;
    });
  }

  // ── Trainers ──────────────────────────────────────────────────────────────
  context += "\n=== TRAINERS ===\n";
  if (trainers.length === 0) {
    context += "No trainer information available.\n";
  } else {
    trainers.forEach((t) => {
      const name = t.user_id
        ? `${t.user_id.firstName} ${t.user_id.lastName}`
        : "Trainer";
      context += `- Name: ${name} | Specialization: ${
        t.specialization || "General Fitness"
      }\n`;
      if (t.bio) context += `  Bio: ${t.bio}\n`;
      if (t.certifications?.length)
        context += `  Certifications: ${t.certifications.join(", ")}\n`;
    });
  }

  return context;
};

/**
 * Main entry point — builds DB context then asks Gemini.
 * @param {string} question
 * @returns {Promise<string>}
 */
export const askChatbot = async (question) => {
  const context = await buildContext();
  return await getGymAnswer(context, question);
};
