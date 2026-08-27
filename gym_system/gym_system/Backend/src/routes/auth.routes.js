import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { protect }         from "../middlewares/auth.middleware.js";
import { uploadSingle }    from "../utils/upload.js";
import { validate }        from "../middlewares/validatedto.middleware.js";
import {
  RegisterDTO,
  LoginDTO,
  UpdateUserDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from "../dto/user.dto.js";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Public routes  (no token required)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route  POST /api/auth/register
 * @desc   Create a new user account
 * @access Public
 * @body   { name, email, password, role?, address?, contact? }
 */
router.post("/register",
  validate(RegisterDTO),
  authController.register
);

/**
 * @route  POST /api/auth/login
 * @desc   Login and receive a JWT
 * @access Public
 * @body   { email, password }
 */
router.post("/login",
  validate(LoginDTO),
  authController.login
);

/**
 * @route  POST /api/auth/forgot-password
 * @desc   Send a password reset link to the registered email
 * @access Public
 * @body   { email }
 */
router.post("/forgot-password",
  validate(ForgotPasswordDTO),
  authController.forgotPassword
);

/**
 * @route  POST /api/auth/send-otp
 * @desc   Check email exists then send a 6-digit OTP
 * @access Public
 * @body   { email }
 */
router.post("/send-otp",
  validate(ForgotPasswordDTO),
  authController.sendOtp
);

/**
 * @route  POST /api/auth/verify-otp
 * @desc   Verify OTP code sent to email
 * @access Public
 * @body   { email, otp }
 */
router.post("/verify-otp", authController.verifyOtp);

/**
 * @route  POST /api/auth/resend-otp
 * @desc   Resend OTP (1-minute cooldown)
 * @access Public
 * @body   { email }
 */
router.post("/resend-otp",
  validate(ForgotPasswordDTO),
  authController.resendOtp
);

/**
 * @route  POST /api/auth/reset-password-otp
 * @desc   Reset password after OTP verification
 * @access Public
 * @body   { email, password, confirmPassword }
 */
router.post("/reset-password-otp", authController.resetPasswordWithOtp);

/**
 * @route  POST /api/auth/reset-password/:token
 * @desc   Reset password using a valid reset token from the email link
 * @access Public
 * @params token  — raw reset token from the email URL
 * @body   { password, confirmPassword }
 */
router.post("/reset-password/:token",
  validate(ResetPasswordDTO),
  authController.resetPassword
);

// ─────────────────────────────────────────────────────────────────────────────
// Protected routes  (valid JWT required)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route  GET /api/auth/me
 * @desc   Get the currently logged-in user's profile
 * @access Private
 */
router.get("/me",
  protect,
  authController.getMe
);

/**
 * @route  PATCH /api/auth/me
 * @desc   Update basic profile info (name, address, contact)
 * @access Private
 * @body   { name?, address?, contact? }
 */
router.patch("/me",
  protect,
  validate(UpdateUserDTO),
  authController.updateMe
);

/**
 * @route  POST /api/auth/me/image
 * @desc   Upload profile picture
 * @access Private
 */
router.post("/me/image",
  protect,
  uploadSingle("profiles", "image"),
  authController.uploadProfileImage
);

/**
 * @route  PATCH /api/auth/change-password
 * @desc   Change password while logged in
 * @access Private
 * @body   { currentPassword, newPassword, confirmPassword }
 */
router.patch("/change-password",
  protect,
  validate(ChangePasswordDTO),
  authController.changePassword
);

/**
 * @route  DELETE /api/auth/me
 * @desc   Soft-delete (deactivate) the logged-in user's account
 * @access Private
 */
router.delete("/me",
  protect,
  authController.deleteMe
);

/**
 * @route  POST /api/auth/logout
 * @desc   Clear JWT cookie (stateless — client must also discard token)
 * @access Private
 */
router.post("/logout",
  protect,
  authController.logout
);

export default router;
