import * as authService from "../services/auth.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// Shared error responder — reads statusCode set by service layer
// ─────────────────────────────────────────────────────────────────────────────
const handleError = (res, err) => {
  const status = err.statusCode || 500;
  return res.status(status).json({
    status : "error",
    message: err.message || "An unexpected error occurred.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    // req.dto is populated by the validate(RegisterDTO) middleware
    const result = await authService.registerUser(req.dto);

    return res.status(201).json({
      status : "success",
      message: "Account created successfully.",
      token  : result.token,
      user   : result.user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.dto);

    return res.status(200).json({
      status : "success",
      message: "Logged in successfully.",
      token  : result.token,
      user   : result.user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me          [protected]
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    // req.user is already attached by the protect middleware
    const user = await authService.getMe(req.user._id);

    return res.status(200).json({
      status: "success",
      user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/auth/me        [protected]
// ─────────────────────────────────────────────────────────────────────────────
export const updateMe = async (req, res) => {
  try {
    const user = await authService.updateMe(req.user._id, req.dto);

    return res.status(200).json({
      status : "success",
      message: "Profile updated successfully.",
      user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/me/image    [protected]
// ─────────────────────────────────────────────────────────────────────────────
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "Please upload a file" });
    }

    // req.file.webPath is attached by the uploadSingle middleware
    const imagePath = req.file.webPath;
    
    // Update user record
    const user = await authService.updateMe(req.user._id, { profile_image: imagePath });

    return res.status(200).json({
      status: "success",
      message: "Profile image uploaded successfully",
      profile_image: imagePath,
      user
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/auth/change-password   [protected]
// ─────────────────────────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const result = await authService.changePassword(req.user._id, req.dto);

    return res.status(200).json({
      status : "success",
      message: "Password changed successfully.",
      token  : result.token,   // fresh token
      user   : result.user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    // Always return 200 — don't reveal whether the email exists
    await authService.forgotPassword(req.dto.email);

    return res.status(200).json({
      status : "success",
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/send-otp
// ─────────────────────────────────────────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const result = await authService.sendOtp(req.dto.email);
    return res.status(200).json({
      status : "success",
      message: "OTP sent to your email address.",
      email  : result.email,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ status: "error", message: "Email and OTP are required." });
    }
    await authService.verifyOtp(email, otp);
    return res.status(200).json({
      status : "success",
      message: "OTP verified successfully. You may now reset your password.",
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp
// ─────────────────────────────────────────────────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const result = await authService.resendOtp(req.dto.email);
    return res.status(200).json({
      status : "success",
      message: "A new OTP has been sent to your email address.",
      email  : result.email,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password-otp
// ─────────────────────────────────────────────────────────────────────────────
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and new password are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ status: "error", message: "Passwords do not match." });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: "error", message: "Password must be at least 6 characters." });
    }
    const result = await authService.resetPasswordWithOtp(email, password);
    return res.status(200).json({
      status : "success",
      message: "Password has been reset successfully.",
      token  : result.token,
      user   : result.user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password/:token
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.dto;

    const result = await authService.resetPassword(token, password);

    return res.status(200).json({
      status : "success",
      message: "Password has been reset successfully.",
      token  : result.token,
      user   : result.user,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/auth/me       [protected]  — soft delete (deactivate)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteMe = async (req, res) => {
  try {
    await authService.deleteMe(req.user._id);

    return res.status(200).json({
      status : "success",
      message: "Your account has been deactivated.",
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout     (stateless JWT — just confirm on client side)
// ─────────────────────────────────────────────────────────────────────────────
export const logout = (_req, res) => {
  // For cookie-based auth: clear the cookie
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure  : process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    status : "success",
    message: "Logged out successfully. Please discard your token on the client.",
  });
};
