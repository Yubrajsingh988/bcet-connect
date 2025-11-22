// backend/src/modules/auth/auth.routes.js

const express = require("express");
const router = express.Router();

const authController = require("./auth.controller");
const authMiddleware = require("../../middleware/authMiddleware");

// OPTIONAL middlewares you may enable later:
// const rateLimiter = require("../../middleware/rateLimiter");
// const validateRequest = require("../../middleware/validateRequest");
// const { registerSchema, loginSchema } = require("./auth.validation");

/**
 * NOTE about routing & backward-compatibility:
 *  - This router only defines routes relative to where it's mounted.
 *  - If you mount in app.js as app.use("/api", routes)  => final path: /api/auth/login
 *  - If you mount as app.use("/api/v1", routes)     => final path: /api/v1/auth/login
 *  Keep only one mount in app.js in production. During migration you may temporarily mount both.
 */

/**
 * @route   POST /auth/register
 * @desc    Public registration (only student | alumni | faculty allowed by validation/controller)
 * @access  Public
 */
router.post(
  "/register",
  // rateLimiter, // enable to protect from abuse
  // validateRequest(registerSchema), // enable to validate body before controller
  authController.register
);

/**
 * @route   POST /auth/login
 * @desc    Login with email & password → returns { user, accessToken, expiresIn } inside standardized ApiResponse
 * @access  Public
 */
router.post(
  "/login",
  // rateLimiter, // enable to protect from brute-force
  // validateRequest(loginSchema),
  authController.login
);

/**
 * @route   GET /auth/me
 * @desc    Get current logged-in user's profile
 * @access  Private (requires JWT via authMiddleware)
 */
router.get("/me", authMiddleware, authController.me);

/* FUTURE (uncomment & implement when needed)
router.post("/logout", authMiddleware, authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
*/

module.exports = router;
