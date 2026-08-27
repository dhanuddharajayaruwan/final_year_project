import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// Transporter — created once and reused
// ─────────────────────────────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 587,
    secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for 587/25
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
};

const transporter = createTransporter();

// ─────────────────────────────────────────────────────────────────────────────
// Brand colours & shared styles
// ─────────────────────────────────────────────────────────────────────────────
const BRAND = {
  name: "Cylon Force Gym",
  primary: "#dc2626", // red-600
  dark: "#121212", // dark black
  light: "#fef2f2", // soft red bg
  accent: "#16a34a", // green-600
  danger: "#dc2626", // red-600
  link: process.env.FRONTEND_URL || "http://localhost:5173",
};

// ─────────────────────────────────────────────────────────────────────────────
// Base HTML wrapper  (every email uses this shell)
// ─────────────────────────────────────────────────────────────────────────────
const baseTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND.dark} 0%,${
  BRAND.primary
} 100%);
                     padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;
                       letter-spacing:1px;text-transform:uppercase;">
              💪 ${BRAND.name}
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
              Your Fitness Journey Starts Here
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;
                     border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              © ${new Date().getFullYear()} ${
  BRAND.name
}. All rights reserved.<br/>
              <a href="${BRAND.link}" style="color:${
  BRAND.primary
};text-decoration:none;">
                Visit our website
              </a>
              &nbsp;|&nbsp;
              <a href="${
                BRAND.link
              }/unsubscribe" style="color:#94a3b8;text-decoration:none;">
                Unsubscribe
              </a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// Button component helper
// ─────────────────────────────────────────────────────────────────────────────
const btn = (text, url, color = BRAND.primary) => `
  <div style="text-align:center;margin:28px 0;">
    <a href="${url}"
       style="display:inline-block;background:${color};color:#ffffff;
              text-decoration:none;padding:14px 36px;border-radius:8px;
              font-size:15px;font-weight:600;letter-spacing:0.5px;
              box-shadow:0 4px 12px rgba(37,99,235,0.3);">
      ${text}
    </a>
  </div>`;

// Divider
const divider = `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>`;

// ─────────────────────────────────────────────────────────────────────────────
// Core send function
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{ to, subject, html, text? }} options
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const info = await transporter.sendMail({
    from: `"${BRAND.name}" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
    text: text ?? subject, // plain-text fallback
  });

  if (process.env.NODE_ENV === "development") {
    console.log(
      `Email sent to ${to} | subject: "${subject}" | id: ${info.messageId}`
    );
  }

  return info;
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Email Templates ───────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// 1. Welcome / Registration
export const sendWelcomeEmail = ({ to, name }) => {
  const html = baseTemplate(
    "Welcome to FitZone!",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Welcome, ${name}! 🎉
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
      We're excited to have you join <strong>${
        BRAND.name
      }</strong>. Your account is ready
      and your fitness journey begins today!
    </p>
    ${divider}
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 4px;">
      Here's what you can do next:
    </p>
    <ul style="color:#475569;font-size:14px;line-height:2;padding-left:20px;">
      <li>Complete your body info profile</li>
      <li>Browse available trainers</li>
      <li>Book your first training session</li>
      <li>Shop our gym products</li>
    </ul>
    ${btn("Go to Dashboard", `${BRAND.link}/dashboard`)}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Need help? Contact us at
      <a href="mailto:${process.env.MAIL_USER}" style="color:${BRAND.primary};">
        ${process.env.MAIL_USER}
      </a>
    </p>
  `
  );

  return sendEmail({
    to,
    subject: `Welcome to ${BRAND.name} 💪`,
    html,
    text: `Welcome ${name}! Your account at ${BRAND.name} is ready.`,
  });
};

// 2. Forgot Password / Reset Link
export const sendPasswordResetEmail = ({
  to,
  name,
  resetUrl,
  expiresInMinutes = 15,
}) => {
  const html = baseTemplate(
    "Reset Your Password",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Password Reset Request 🔐
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi <strong>${name}</strong>, we received a request to reset your password.
      Click the button below to create a new password.
    </p>
    <div style="background:${BRAND.light};border-left:4px solid ${
      BRAND.primary
    };
                padding:14px 20px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;color:#475569;font-size:13px;">
        ⏱ This link expires in <strong>${expiresInMinutes} minutes</strong>.
        If you did not request this, please ignore this email.
      </p>
    </div>
    ${btn("Reset My Password", resetUrl, BRAND.dark)}
    ${divider}
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
      Or copy and paste this link into your browser:<br/>
      <span style="color:${
        BRAND.primary
      };word-break:break-all;">${resetUrl}</span>
    </p>
  `
  );

  return sendEmail({
    to,
    subject: `${BRAND.name} — Reset Your Password`,
    html,
    text: `Hi ${name}, reset your password here: ${resetUrl}  (expires in ${expiresInMinutes} min)`,
  });
};

// 3. Password Changed Confirmation
export const sendPasswordChangedEmail = ({ to, name }) => {
  const html = baseTemplate(
    "Password Changed",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Password Successfully Changed ✅
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi <strong>${name}</strong>, your ${BRAND.name} account password was just changed.
    </p>
    <div style="background:#fef2f2;border-left:4px solid ${BRAND.danger};
                padding:14px 20px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;color:#7f1d1d;font-size:13px;">
        🚨 If you did <strong>not</strong> make this change, please contact us immediately
        or reset your password right away.
      </p>
    </div>
  `
  );

  return sendEmail({
    to,
    subject: `${BRAND.name} — Your Password Was Changed`,
    html,
    text: `Hi ${name}, your password was changed. If this wasn't you, reset it immediately.`,
  });
};

// 4. Order Confirmation
export const sendOrderConfirmationEmail = ({
  to,
  name,
  orderId,
  productName,
  amount,
  orderDate,
}) => {
  const html = baseTemplate(
    "Order Confirmed",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Your Order is Confirmed! 🛒
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hi <strong>${name}</strong>, thank you for your purchase. Here's your order summary:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8fafc;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <tr style="background:${BRAND.primary};">
        <th style="padding:10px 16px;color:#fff;font-size:13px;text-align:left;">Field</th>
        <th style="padding:10px 16px;color:#fff;font-size:13px;text-align:left;">Details</th>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">Order ID</td>
        <td style="padding:12px 16px;color:${BRAND.dark};font-weight:600;font-size:14px;border-bottom:1px solid #e2e8f0;">#${orderId}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">Product</td>
        <td style="padding:12px 16px;color:${BRAND.dark};font-weight:600;font-size:14px;border-bottom:1px solid #e2e8f0;">${productName}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">Amount</td>
        <td style="padding:12px 16px;color:${BRAND.accent};font-weight:700;font-size:14px;border-bottom:1px solid #e2e8f0;">Rs.${amount}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;">Date</td>
        <td style="padding:12px 16px;color:${BRAND.dark};font-size:14px;">${orderDate}</td>
      </tr>
    </table>
  `
  );

  return sendEmail({
    to,
    subject: `${BRAND.name} — Order Confirmed #${orderId}`,
    html,
    text: `Hi ${name}, your order #${orderId} for ${productName} ($${amount}) has been confirmed.`,
  });
};

// 4b. Payment Success Confirmation
export const sendPaymentSuccessEmail = ({
  to,
  name,
  orderId,
  amount,
  paymentDate,
}) => {
  const isSubscription = String(orderId).startsWith("SUB_");
  const typeLabel = isSubscription ? "Subscription" : "Order";

  const statusNote = isSubscription
    ? "🏋️ Your training subscription has been successfully <strong>activated</strong>. You can now access your personalized coaching and workout plans."
    : "📦 Your order will be <strong>shipped within 1–2 business days</strong>. You'll receive a shipping update email with tracking details.";

  const html = baseTemplate(
    "Payment Successful",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Payment Received! 🎉
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hi <strong>${name}</strong>, great news! We've successfully received your payment.
      Your ${typeLabel.toLowerCase()} is now being ${
      isSubscription ? "activated" : "processed and will be shipped soon"
    }.
    </p>

    <!-- Success Box -->
    <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;
                padding:28px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#15803d;font-size:13px;font-weight:600;
                text-transform:uppercase;letter-spacing:1px;">Amount Paid</p>
      <p style="margin:0;color:#15803d;font-size:36px;font-weight:800;">Rs ${Number(
        amount
      ).toLocaleString()}</p>
    </div>

    <!-- Details Table -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8fafc;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <tr style="background:${BRAND.primary};">
        <th style="padding:12px 16px;color:#fff;font-size:12px;text-align:left;text-transform:uppercase;letter-spacing:1px;">Detail</th>
        <th style="padding:12px 16px;color:#fff;font-size:12px;text-align:left;text-transform:uppercase;letter-spacing:1px;">Info</th>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">${typeLabel} ID</td>
        <td style="padding:12px 16px;color:${
          BRAND.dark
        };font-weight:600;font-size:14px;border-bottom:1px solid #e2e8f0;">#${orderId}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">Payment Status</td>
        <td style="padding:12px 16px;font-weight:700;font-size:14px;border-bottom:1px solid #e2e8f0;color:#16a34a;">✅ PAID</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;">Payment Date</td>
        <td style="padding:12px 16px;color:${
          BRAND.dark
        };font-size:14px;">${paymentDate}</td>
      </tr>
    </table>

    <!-- Status Note -->
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;
                padding:18px 20px;border-radius:8px;margin:16px 0;">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
        ${statusNote}
      </p>
    </div>

    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:24px 0 0;">
      Questions? Contact us at
      <a href="mailto:${process.env.MAIL_USER}" style="color:${
      BRAND.primary
    };font-weight:600;text-decoration:none;">
        ${process.env.MAIL_USER}
      </a>
    </p>
  `
  );

  return sendEmail({
    to,
    subject: `${BRAND.name} — ${typeLabel} Payment Confirmed ✅ #${orderId}`,
    html,
    text: `Hi ${name}, your payment of Rs ${amount} for ${typeLabel.toLowerCase()} #${orderId} was successful.`,
  });
};

// 5. Subscription Confirmation
export const sendSubscriptionEmail = ({
  to,
  name,
  duration,
  startedDate,
  expireDate,
}) => {
  const html = baseTemplate(
    "Subscription Activated",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Training Subscription Active! 🏋️
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hi <strong>${name}</strong>, your training subscription has been successfully activated.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:20px;">
      <tr>
        <td style="padding:14px 20px;color:#475569;font-size:14px;border-bottom:1px solid #bbf7d0;">Duration</td>
        <td style="padding:14px 20px;color:${
          BRAND.dark
        };font-weight:600;font-size:14px;border-bottom:1px solid #bbf7d0;">${duration} days</td>
      </tr>
      <tr>
        <td style="padding:14px 20px;color:#475569;font-size:14px;border-bottom:1px solid #bbf7d0;">Started</td>
        <td style="padding:14px 20px;color:${
          BRAND.dark
        };font-size:14px;border-bottom:1px solid #bbf7d0;">${startedDate}</td>
      </tr>
      <tr>
        <td style="padding:14px 20px;color:#475569;font-size:14px;">Expires</td>
        <td style="padding:14px 20px;color:${
          BRAND.danger
        };font-weight:600;font-size:14px;">${expireDate}</td>
      </tr>
    </table>
    ${btn("Book a Training Session", `${BRAND.link}/schedule`, BRAND.accent)}
  `
  );

  return sendEmail({
    to,
    subject: `${BRAND.name} — Subscription Activated 🏋️`,
    html,
    text: `Hi ${name}, your ${duration}-day training subscription is active until ${expireDate}.`,
  });
};

export const sendSubscriptionExpiryReminderEmail = ({
  to,
  name,
  subscriptionName,
  expireDate,
}) => {
  const html = baseTemplate(
    "Subscription Expires Tomorrow",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Subscription Expiring Soon ⏰
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi <strong>${name}</strong>, this is a friendly reminder that your
      <strong>${subscriptionName}</strong> subscription will expire tomorrow.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:20px;">
      <tr>
        <td style="padding:14px 20px;color:#475569;font-size:14px;border-bottom:1px solid #fed7aa;">Subscription</td>
        <td style="padding:14px 20px;color:${
          BRAND.dark
        };font-weight:600;font-size:14px;border-bottom:1px solid #fed7aa;">${subscriptionName}</td>
      </tr>
      <tr>
        <td style="padding:14px 20px;color:#475569;font-size:14px;">Expiry Date</td>
        <td style="padding:14px 20px;color:${
          BRAND.danger
        };font-weight:700;font-size:14px;">${expireDate}</td>
      </tr>
    </table>
    ${btn("Renew Subscription", `${BRAND.link}/subscriptions`, BRAND.primary)}
  `
  );

  return sendEmail({
    to,
    subject: `${BRAND.name} - ${subscriptionName} expires tomorrow`,
    html,
    text: `Hi ${name}, your ${subscriptionName} subscription expires tomorrow (${expireDate}). Please renew to continue your training access.`,
  });
};

// 6. Schedule / Booking Confirmation
export const sendScheduleConfirmationEmail = ({
  to,
  name,
  scheduleType,
  trainerName,
  scheduleDate,
  expireDate,
}) => {
  const typeLabel = scheduleType.replace(/_/g, " ");
  const html = baseTemplate(
    "Session Booked",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Session Booked Successfully! 📅
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hi <strong>${name}</strong>, your training session has been confirmed.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8fafc;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">Session Type</td>
        <td style="padding:12px 16px;color:${
          BRAND.dark
        };font-weight:600;text-transform:capitalize;">${typeLabel}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">Trainer</td>
        <td style="padding:12px 16px;color:${
          BRAND.dark
        };font-weight:600;">${trainerName}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">Date</td>
        <td style="padding:12px 16px;color:${BRAND.dark};">${scheduleDate}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;">Expires</td>
        <td style="padding:12px 16px;color:${
          BRAND.danger
        };font-weight:600;">${expireDate}</td>
      </tr>
    </table>
    ${btn("View My Schedule", `${BRAND.link}/schedule`)}
  `
  );

  return sendEmail({
    to,
    subject: `${BRAND.name} — Session Booked with ${trainerName}`,
    html,
    text: `Hi ${name}, your ${typeLabel} session with ${trainerName} on ${scheduleDate} is confirmed.`,
  });
};

// 7. Shipping Update
export const sendShippingUpdateEmail = ({
  to,
  name,
  orderId,
  status,
  trackingNumber,
  courierName,
  estimatedDelivery,
}) => {
  const statusColors = {
    processing: BRAND.primary,
    shipped: BRAND.accent,
    in_transit: "#f59e0b",
    delivered: BRAND.accent,
    returned: BRAND.danger,
  };
  const color = statusColors[status] ?? BRAND.primary;
  const statusLabel = status.replace(/_/g, " ").toUpperCase();

  const html = baseTemplate(
    "Shipping Update",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Your Order is on the Move! 📦
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi <strong>${name}</strong>, here's the latest update for order
      <strong>#${orderId}</strong>:
    </p>
    <div style="background:${color}18;border:2px solid ${color};border-radius:10px;
                padding:16px 24px;text-align:center;margin-bottom:20px;">
      <p style="margin:0;font-size:20px;font-weight:700;color:${color};">
        ${statusLabel}
      </p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8fafc;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      ${
        trackingNumber
          ? `
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">Tracking No.</td>
        <td style="padding:12px 16px;color:${BRAND.dark};font-weight:600;font-size:14px;border-bottom:1px solid #e2e8f0;">${trackingNumber}</td>
      </tr>`
          : ""
      }
      ${
        courierName
          ? `
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0;">Courier</td>
        <td style="padding:12px 16px;color:${BRAND.dark};font-size:14px;border-bottom:1px solid #e2e8f0;">${courierName}</td>
      </tr>`
          : ""
      }
      ${
        estimatedDelivery
          ? `
      <tr>
        <td style="padding:12px 16px;color:#475569;font-size:14px;">Est. Delivery</td>
        <td style="padding:12px 16px;color:${BRAND.accent};font-weight:600;font-size:14px;">${estimatedDelivery}</td>
      </tr>`
          : ""
      }
    </table>
    ${btn("Track My Order", `${BRAND.link}/orders/${orderId}`)}
  `
  );

  return sendEmail({
    to,
    subject: `${BRAND.name} — Order #${orderId} Update: ${statusLabel}`,
    html,
    text: `Hi ${name}, order #${orderId} status: ${statusLabel}. Tracking: ${
      trackingNumber ?? "N/A"
    }.`,
  });
};

// 8. OTP — Password Reset via OTP
export const sendOtpEmail = ({ to, name, otp, expiresInMinutes = 10 }) => {
  const html = baseTemplate(
    "Your Password Reset OTP",
    `
    <h2 style="margin:0 0 8px;color:${BRAND.dark};font-size:22px;">
      Password Reset OTP 🔑
    </h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi <strong>${name}</strong>, we received a request to reset your
      <strong>${BRAND.name}</strong> account password. Use the one-time code
      below to proceed.
    </p>
    <div style="background:linear-gradient(135deg,${BRAND.dark} 0%,${BRAND.primary} 100%);
                border-radius:12px;padding:28px 20px;text-align:center;margin:20px 0;">
      <p style="margin:0 0 6px;color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:1px;
                text-transform:uppercase;">Your One-Time Password</p>
      <p style="margin:0;color:#ffffff;font-size:42px;font-weight:800;letter-spacing:12px;
                font-family:'Courier New',monospace;">${otp}</p>
    </div>
    <div style="background:${BRAND.light};border-left:4px solid ${BRAND.primary};
                padding:14px 20px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;color:#475569;font-size:13px;">
        ⏱ This code expires in <strong>${expiresInMinutes} minutes</strong>.
        Never share this code with anyone. If you did not request this, please
        ignore this email.
      </p>
    </div>
    ${divider}
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
      Need help? Contact us at
      <a href="mailto:${process.env.MAIL_USER}" style="color:${BRAND.primary};">
        ${process.env.MAIL_USER}
      </a>
    </p>
  `
  );

  return sendEmail({
    to,
    subject: `${BRAND.name} — Your Password Reset Code: ${otp}`,
    html,
    text: `Hi ${name}, your ${BRAND.name} password reset OTP is: ${otp}  (expires in ${expiresInMinutes} minutes). Never share this code.`,
  });
};

// 9. Generic / Custom email (escape hatch for any other needs)
export const sendCustomEmail = ({
  to,
  subject,
  heading,
  bodyText,
  buttonText,
  buttonUrl,
}) => {
  const html = baseTemplate(
    subject,
    `
    <h2 style="margin:0 0 8px;color:${
      BRAND.dark
    };font-size:22px;">${heading}</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">${bodyText}</p>
    ${buttonText && buttonUrl ? btn(buttonText, buttonUrl) : ""}
  `
  );

  return sendEmail({ to, subject, html, text: bodyText });
};

// ─────────────────────────────────────────────────────────────────────────────
// Verify SMTP connection (call on startup to catch bad credentials early)
// ─────────────────────────────────────────────────────────────────────────────
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("Email transporter ready ✅");
    return true;
  } catch (err) {
    console.warn(`Email transporter not ready ⚠️  — ${err.message}`);
    return false;
  }
};
