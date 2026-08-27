import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLE_ENUM } from "../enums/index.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries unless explicitly selected
    },
    address: {
      street: { type: String, trim: true, default: null },
      city: { type: String, trim: true, default: null },
      district: { type: String, trim: true, default: null },
      province: { type: String, trim: true, default: null },
      postal_code: { type: String, trim: true, default: null },
      country: { type: String, trim: true, default: "Sri Lanka" },
    },
    contact: {
      type: String,
      trim: true,
      default: null,
    },
    profile_image: {
      type: String,
      trim: true,
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ROLE_ENUM,
      default: "client",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    terms_accepted: {
      type: Boolean,
      default: false,
    },
    terms_accepted_at: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
    // ── OTP-based password reset ────────────────────────────────────────────
    otpCode: {
      type: String,
      default: null,
      select: false,
    },
    otpExpires: {
      type: Date,
      default: null,
      select: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ── Pre-save hook: hash password before saving ─────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare passwords ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: return safe user object (no password) ────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
