import crypto from "crypto";
import User from "../models/User.js";
import { signToken } from "../middlewares/auth.middleware.js";
import { deleteFile } from "../utils/upload.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendOtpEmail,
} from "../utils/email.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper — build a token payload + sign
// ─────────────────────────────────────────────────────────────────────────────
const issueToken = (user) =>
  signToken({ id: user._id, role: user.role, email: user.email });

// ─────────────────────────────────────────────────────────────────────────────
// registerUser
// ─────────────────────────────────────────────────────────────────────────────
export const registerUser = async ({
  name,
  email,
  password,
  role,
  address,
  contact,
  dob,
  terms_accepted,
}) => {
  // 1. Duplicate email check
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    const err = new Error("An account with this email already exists.");
    err.statusCode = 409;
    throw err;
  }

  if (terms_accepted !== true) {
    const err = new Error("You must agree to the Terms & Conditions.");
    err.statusCode = 400;
    throw err;
  }

  // 2. Create user (password is hashed by pre-save hook in model)
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role    : role    ?? "client",
    address : address ?? null,
    contact : contact ?? null,
    dob     : dob     ?? null,
    terms_accepted: true,
    terms_accepted_at: new Date(),
  });

  // 3. Send welcome email (non-blocking — don't await)
  sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
    console.warn("Welcome email failed:", err.message)
  );

  // 4. Return token + safe user
  const token = issueToken(user);
  return { token, user: user.toSafeObject() };
};

// ─────────────────────────────────────────────────────────────────────────────
// loginUser
// ─────────────────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  // 1. Find user — explicitly select password (it is excluded by default)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!user) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  // 2. Account active check
  if (!user.isActive) {
    const err = new Error("Your account has been deactivated. Please contact support.");
    err.statusCode = 403;
    throw err;
  }

  // 3. Password match
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  // 4. Issue token
  const token = issueToken(user);
  return { token, user: user.toSafeObject() };
};

// ─────────────────────────────────────────────────────────────────────────────
// getMe  — fetch current authenticated user's full profile
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
  return user.toSafeObject();
};

// ─────────────────────────────────────────────────────────────────────────────
// updateMe  — let the logged-in user update their own basic info
// ─────────────────────────────────────────────────────────────────────────────
export const updateMe = async (userId, { name, address, contact, profile_image, dob }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  const updates = {};
  if (name          !== undefined) updates.name    = name.trim();
  if (address       !== undefined) updates.address = address;
  if (contact       !== undefined) updates.contact = contact;
  if (dob           !== undefined) updates.dob     = dob;

  if (profile_image !== undefined) {
    // Delete old image if a new one is uploaded
    if (user.profile_image && user.profile_image !== profile_image) {
      await deleteFile(user.profile_image);
    }
    updates.profile_image = profile_image;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new           : true,
    runValidators : true,
  });

  return updatedUser.toSafeObject();
};

// ─────────────────────────────────────────────────────────────────────────────
// changePassword  — logged-in user changes their own password
// ─────────────────────────────────────────────────────────────────────────────
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  // Fetch with password
  const user = await User.findById(userId).select("+password");
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const err = new Error("Current password is incorrect.");
    err.statusCode = 400;
    throw err;
  }

  // Set new password — pre-save hook re-hashes it
  user.password = newPassword;
  await user.save();

  // Notify user (non-blocking)
  sendPasswordChangedEmail({ to: user.email, name: user.name }).catch((err) =>
    console.warn("Password changed email failed:", err.message)
  );

  // Issue a fresh token so the client stays logged in
  const token = issueToken(user);
  return { token, user: user.toSafeObject() };
};

// ─────────────────────────────────────────────────────────────────────────────
// forgotPassword  — generate reset token & email it (legacy token flow)
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Always respond success even if user not found (prevents email enumeration)
  if (!user) return;

  // Generate a secure random token
  const rawToken  = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken  = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await user.save({ validateBeforeSave: false });

  // Build the reset URL (frontend URL)
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail({
    to               : user.email,
    name             : user.name,
    resetUrl,
    expiresInMinutes : 15,
  }).catch((err) => console.warn("Reset email failed:", err.message));
};

// ─────────────────────────────────────────────────────────────────────────────
// resetPassword  — consume token and set a new password (legacy token flow)
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (rawToken, newPassword) => {
  // Hash the incoming raw token to compare with DB value
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    resetPasswordToken  : hashedToken,
    resetPasswordExpires: { $gt: Date.now() },  // still valid
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    const err = new Error("Reset token is invalid or has expired.");
    err.statusCode = 400;
    throw err;
  }

  // Update password and clear reset fields
  user.password             = newPassword;  // pre-save hook hashes it
  user.resetPasswordToken   = null;
  user.resetPasswordExpires = null;
  await user.save();

  // Notify the user
  sendPasswordChangedEmail({ to: user.email, name: user.name }).catch((err) =>
    console.warn("Password changed email failed:", err.message)
  );

  const token = issueToken(user);
  return { token, user: user.toSafeObject() };
};

// ─────────────────────────────────────────────────────────────────────────────
// sendOtp  — check email exists in DB then send a 6-digit OTP
// ─────────────────────────────────────────────────────────────────────────────
export const sendOtp = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select("+otpCode +otpExpires +otpVerified");

  if (!user) {
    const err = new Error("No account found with this email address.");
    err.statusCode = 404;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("Your account has been deactivated. Please contact support.");
    err.statusCode = 403;
    throw err;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otpCode     = otp;
  user.otpExpires  = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  user.otpVerified = false;
  await user.save({ validateBeforeSave: false });

  // Send OTP email
  await sendOtpEmail({
    to  : user.email,
    name: user.name,
    otp,
    expiresInMinutes: 10,
  }).catch((err) => console.warn("OTP email failed:", err.message));

  return { email: user.email };
};

// ─────────────────────────────────────────────────────────────────────────────
// verifyOtp  — validate OTP and mark otpVerified so password can be reset
// ─────────────────────────────────────────────────────────────────────────────
export const verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select("+otpCode +otpExpires +otpVerified");

  if (!user) {
    const err = new Error("No account found with this email address.");
    err.statusCode = 404;
    throw err;
  }

  if (!user.otpCode || !user.otpExpires) {
    const err = new Error("No OTP has been issued. Please request a new one.");
    err.statusCode = 400;
    throw err;
  }

  if (new Date() > user.otpExpires) {
    const err = new Error("OTP has expired. Please request a new one.");
    err.statusCode = 400;
    throw err;
  }

  if (user.otpCode !== otp.toString()) {
    const err = new Error("Invalid OTP. Please check the code and try again.");
    err.statusCode = 400;
    throw err;
  }

  // Mark as verified — the reset password step will check this flag
  user.otpVerified = true;
  user.otpCode     = null; // clear so it can't be reused
  await user.save({ validateBeforeSave: false });

  return { verified: true };
};

// ─────────────────────────────────────────────────────────────────────────────
// resendOtp  — regenerate OTP (enforces 1-minute cooldown)
// ─────────────────────────────────────────────────────────────────────────────
export const resendOtp = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select("+otpCode +otpExpires +otpVerified");

  if (!user) {
    const err = new Error("No account found with this email address.");
    err.statusCode = 404;
    throw err;
  }

  // Enforce 1-minute cooldown: otpExpires is set to (now + 10min) on send,
  // so if (otpExpires - now) > 9 minutes it means it was sent < 1 minute ago.
  if (user.otpExpires) {
    const remainingMs = user.otpExpires.getTime() - Date.now();
    const cooldownMs  = 9 * 60 * 1000; // 9 min remaining means sent < 1 min ago
    if (remainingMs > cooldownMs) {
      const waitSec = Math.ceil((remainingMs - cooldownMs) / 1000);
      const err = new Error(`Please wait ${waitSec} seconds before requesting a new OTP.`);
      err.statusCode = 429;
      throw err;
    }
  }

  // Generate a fresh 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode     = otp;
  user.otpExpires  = new Date(Date.now() + 10 * 60 * 1000);
  user.otpVerified = false;
  await user.save({ validateBeforeSave: false });

  await sendOtpEmail({
    to  : user.email,
    name: user.name,
    otp,
    expiresInMinutes: 10,
  }).catch((err) => console.warn("OTP email failed:", err.message));

  return { email: user.email };
};

// ─────────────────────────────────────────────────────────────────────────────
// resetPasswordWithOtp  — set a new password after OTP was verified
// ─────────────────────────────────────────────────────────────────────────────
export const resetPasswordWithOtp = async (email, newPassword) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select("+password +otpCode +otpExpires +otpVerified");

  if (!user) {
    const err = new Error("No account found with this email address.");
    err.statusCode = 404;
    throw err;
  }

  if (!user.otpVerified) {
    const err = new Error("OTP not verified. Please verify your OTP first.");
    err.statusCode = 403;
    throw err;
  }

  // Reset password — pre-save hook re-hashes it
  user.password    = newPassword;
  user.otpVerified = false;
  user.otpCode     = null;
  user.otpExpires  = null;
  await user.save();

  // Notify user
  sendPasswordChangedEmail({ to: user.email, name: user.name }).catch((err) =>
    console.warn("Password changed email failed:", err.message)
  );

  const token = issueToken(user);
  return { token, user: user.toSafeObject() };
};

// ─────────────────────────────────────────────────────────────────────────────
// deleteMe  — soft-delete: deactivate rather than remove the record
// ─────────────────────────────────────────────────────────────────────────────
export const deleteMe = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
};
