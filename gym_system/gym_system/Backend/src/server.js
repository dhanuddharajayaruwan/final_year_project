import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { verifyEmailConnection } from "./utils/email.js";
import { startSubscriptionLifecycleJob } from "./jobs/subscriptionLifecycle.job.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await verifyEmailConnection();
  startSubscriptionLifecycleJob();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`DB health check → http://localhost:${PORT}/`);
  });
};

startServer();
