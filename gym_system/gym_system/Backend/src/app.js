import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// ── Route imports ──────────────────────────────────────────────────────────────
import authRouter from "./routes/auth.routes.js";
import clientProfileRouter from "./routes/clientProfile.routes.js";
import trainerProfileRouter from "./routes/trainerProfile.routes.js";
import bodyInfoRouter from "./routes/bodyInfo.routes.js";
import trainingClipRouter from "./routes/trainingClip.routes.js";
import scheduleRouter from "./routes/schedule.routes.js";
import subscriptionRouter from "./routes/trainingSubscription.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import shippingRouter from "./routes/shipping.routes.js";
import reviewRouter from "./routes/review.routes.js";
import subscriptionPlanRouter from "./routes/subscriptionPlan.routes.js";
import deliveryFeeRouter from "./routes/deliveryFee.routes.js";

import chatbotRouter from "./routes/chatbot.routes.js";
import contactRouter from "./routes/contact.routes.js";
import chatRouter from "./routes/chat.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files — serve uploaded images publicly ──────────────────────────────
// Accessible at: http://localhost:5000/uploads/<folder>/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health / DB check route ────────────────────────────────────────────────────
app.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;

  // readyState: 0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
  const stateMap = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  res.status(200).json({
    status: "ok",
    message: "Gym System API is running",
    database: {
      state: stateMap[dbState] ?? "Unknown",
      connected: dbState === 1,
    },
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/client-profiles", clientProfileRouter);
app.use("/api/trainer-profiles", trainerProfileRouter);
app.use("/api/body-info", bodyInfoRouter);
app.use("/api/training-clips", trainingClipRouter);
app.use("/api/schedules", scheduleRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/shipping", shippingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/subscription-plans", subscriptionPlanRouter);
app.use("/api/delivery-fees", deliveryFeeRouter);

app.use("/api/chatbot", chatbotRouter);
app.use("/api/contact", contactRouter);
app.use("/api/chats", chatRouter);

// ── Global error handler ───────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

export default app;
