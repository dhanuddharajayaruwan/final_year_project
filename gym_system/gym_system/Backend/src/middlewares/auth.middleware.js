import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper — sign a token
// ─────────────────────────────────────────────────────────────────────────────
export const signToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — verify a raw token string (throws on invalid/expired)
// ─────────────────────────────────────────────────────────────────────────────
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
  return jwt.verify(token, secret);
};

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: protect  — require a valid JWT on any route
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Attach this middleware to routes that require the user to be logged in.
 *
 * Token is read from:
 *   1. Authorization header:  Bearer <token>
 *   2. Cookie:                jwt=<token>   (if you use cookie-based auth)
 *
 * On success  → req.user  = full user document (no password)
 *               req.token = raw token string
 *               next()
 *
 * On failure  → 401 Unauthorized
 */
export const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No token provided.",
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "error",
          message: "Token has expired. Please log in again.",
        });
      }
      return res.status(401).json({
        status: "error",
        message: "Invalid token. Please log in again.",
      });
    }

    // 3. Check the user still exists in DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "The user belonging to this token no longer exists.",
      });
    }

    // 4. Check account is active
    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // 5. Attach to request
    req.user  = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Authentication error",
      ...(process.env.NODE_ENV === "development" && { detail: error.message }),
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: authorize  — restrict to specific roles
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Must be used AFTER protect().
 *
 * Usage:
 *   router.delete("/users/:id", protect, authorize("admin"), controller.deleteUser);
 *   router.get("/trainer-clips", protect, authorize("trainer", "admin"), controller.getClips);
 *
 * @param {...string} roles  — allowed roles (e.g. "admin", "trainer", "client")
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      status: "error",
      message: `Access denied. Required role: [${roles.join(", ")}]. Your role: ${req.user?.role ?? "unknown"}.`,
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: optionalAuth  — attach user if token present, but don't block
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Use this on routes that behave differently for logged-in vs guest users
 * (e.g. public product listing that shows personalised data when logged in).
 *
 * Never returns 401 — simply skips if token is missing or invalid.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      const decoded = verifyToken(token);
      const user    = await User.findById(decoded.id).select("-password");
      if (user && user.isActive) req.user = user;
    }
  } catch {
    // Silently ignore — token missing/invalid is fine for optional routes
  }
  next();
};
