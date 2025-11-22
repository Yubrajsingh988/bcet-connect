// backend/src/modules/auth/auth.controller.js

const { registerSchema, loginSchema } = require("./auth.validation");
const authService = require("./auth.service");
const User = require("../user/user.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");

// Allowed roles for public self-registration
const ALLOWED_SELF_ROLES = ["student", "alumni", "faculty"];

/**
 * Helper to set API version header (optional, useful for debugging)
 */
const setApiVersionHeader = (res, version = "1") => {
  try {
    res.setHeader("X-API-VERSION", `v${version}`);
  } catch (e) {
    // ignore if header cannot be set
  }
};

/**
 * @desc   Register new user
 * @route  POST /api/v1/auth/register  (or /api/auth/register if you mounted without v1)
 * @access Public
 */
exports.register = async (req, res, next) => {
  try {
    // Validate request body (collect all validation errors)
    const value = await registerSchema.validateAsync(req.body, {
      abortEarly: false,
    });

    // Normalize email if present
    if (value.email) {
      value.email = String(value.email).toLowerCase().trim();
    }

    // Prevent assigning protected roles during self-register
    if (value.role) {
      const role = String(value.role).toLowerCase().trim();
      if (!ALLOWED_SELF_ROLES.includes(role)) {
        throw new ApiError(403, "You are not allowed to register with this role");
      }
      value.role = role;
    }

    // Delegate to service which handles duplicate email, hashing etc.
    const user = await authService.register(value);

    // optional: set API version header (useful when both /api and /api/v1 exist)
    setApiVersionHeader(res, process.env.API_VERSION || "1");

    // Return standardized response
    return res
      .status(201)
      .json(new ApiResponse(201, "User registered successfully", user));
  } catch (err) {
    // Joi validation -> convert to ApiError 400
    if (err && err.isJoi) {
      const message =
        err.details?.map((d) => d.message).join(", ") || "Invalid request payload";
      return next(new ApiError(400, message));
    }
    return next(err);
  }
};

/**
 * @desc   Login user
 * @route  POST /api/v1/auth/login  (or /api/auth/login)
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    // Validate
    const value = await loginSchema.validateAsync(req.body, { abortEarly: false });

    // Normalize email
    if (value.email) {
      value.email = String(value.email).toLowerCase().trim();
    }

    // Service handles auth and token generation
    const result = await authService.login(value); // returns { user, accessToken, expiresIn }

    // Set API version header for debugging/compatibility
    setApiVersionHeader(res, process.env.API_VERSION || "1");

    // Standardized response object — frontend can read res.data.data.user / accessToken
    return res.json(new ApiResponse(200, "Login successful", result));
  } catch (err) {
    if (err && err.isJoi) {
      const message =
        err.details?.map((d) => d.message).join(", ") || "Invalid login credentials";
      return next(new ApiError(400, message));
    }
    return next(err);
  }
};

/**
 * @desc   Get current logged-in user
 * @route  GET /api/v1/auth/me  (or /api/auth/me)
 * @access Private
 */
exports.me = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Not authenticated");
    }

    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId)
      .select("-password -refreshToken -__v")
      .lean();

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    setApiVersionHeader(res, process.env.API_VERSION || "1");

    return res.json(new ApiResponse(200, "Current user fetched successfully", user));
  } catch (err) {
    return next(err);
  }
};
