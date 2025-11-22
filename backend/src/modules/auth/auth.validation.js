// backend/src/modules/auth/auth.validation.js

const Joi = require("joi");

// 🚫 IMPORTANT:
// Admin cannot be self-registered via public UI.
// Admin should only be created via DB seed or admin panel.
const ALLOWED_SELF_ROLES = ["student", "alumni", "faculty"];

/**
 * Register schema
 * - trims inputs
 * - collects all validation errors (controller uses abortEarly: false)
 */
exports.registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(80)
    .required()
    .messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name must be less than or equal to 80 characters",
      "any.required": "Name is required",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    // Optional stronger password policy:
    // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$"))
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters long",
      "string.max": "Password must be less than or equal to 128 characters",
      // "string.pattern.base": "Password must contain uppercase, lowercase and a number",
      "any.required": "Password is required",
    }),

  role: Joi.string()
    .trim()
    .valid(...ALLOWED_SELF_ROLES)
    .default("student")
    .messages({
      "any.only":
        "Invalid role selected. Allowed roles: student, alumni, faculty",
    }),
});

/**
 * Login schema
 */
exports.loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
});
