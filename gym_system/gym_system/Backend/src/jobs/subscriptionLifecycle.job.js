import cron from "node-cron";
import TrainingSubscription from "../models/TrainingSubscription.js";
import { sendSubscriptionExpiryReminderEmail } from "../utils/email.js";

const CRON_SCHEDULE = process.env.SUBSCRIPTION_CRON_SCHEDULE || "0 0 * * *";
const CRON_TIMEZONE = process.env.SUBSCRIPTION_CRON_TIMEZONE || "Asia/Colombo";

let isJobRunning = false;

const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

export const runSubscriptionLifecycleOnce = async () => {
  if (isJobRunning) {
    return;
  }

  isJobRunning = true;

  try {
    const now = new Date();
    const { start: todayStart } = getDayBounds(now);

    // Mark active/pending subscriptions as expired when expiry date is before today.
    const expiredResult = await TrainingSubscription.updateMany(
      {
        status: { $in: ["active", "pending"] },
        expire_date: { $lt: todayStart },
      },
      {
        $set: { status: "expired" },
      }
    );

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    // Find subscriptions that expire tomorrow and were not notified yet.
    const subscriptionsToRemind = await TrainingSubscription.find({
      status: "active",
      expire_date: { $gte: tomorrowStart, $lt: tomorrowEnd },
      expire_reminder_sent_at: null,
    })
      .populate("user_id", "name email")
      .populate("subscription_plan_id", "name");

    let remindersSent = 0;

    for (const subscription of subscriptionsToRemind) {
      const user = subscription.user_id;
      const plan = subscription.subscription_plan_id;

      if (!user?.email) {
        continue;
      }

      const expiryDateLabel = new Date(
        subscription.expire_date
      ).toLocaleDateString("en-LK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      try {
        await sendSubscriptionExpiryReminderEmail({
          to: user.email,
          name: user.name || "User",
          subscriptionName: plan?.name || "Training",
          expireDate: expiryDateLabel,
        });

        subscription.expire_reminder_sent_at = new Date();
        await subscription.save();
        remindersSent += 1;
      } catch (err) {
        console.warn(
          `Failed to send subscription expiry reminder to ${user.email}: ${err.message}`
        );
      }
    }

    if (expiredResult.modifiedCount > 0 || remindersSent > 0) {
      console.log(
        `Subscription lifecycle job: expired=${expiredResult.modifiedCount}, reminders=${remindersSent}`
      );
    }
  } catch (err) {
    console.error("Subscription lifecycle job failed:", err.message);
  } finally {
    isJobRunning = false;
  }
};

export const startSubscriptionLifecycleJob = () => {
  const task = cron.schedule(
    CRON_SCHEDULE,
    async () => {
      await runSubscriptionLifecycleOnce();
    },
    {
      timezone: CRON_TIMEZONE,
    }
  );

  // Run once on startup to catch anything missed while the server was offline.
  runSubscriptionLifecycleOnce().catch((err) => {
    console.error("Initial subscription lifecycle run failed:", err.message);
  });

  console.log(
    `Subscription lifecycle cron started (${CRON_SCHEDULE}, timezone=${CRON_TIMEZONE})`
  );

  return task;
};
