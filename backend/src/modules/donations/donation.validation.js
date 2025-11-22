// backend/src/modules/donations/donation.validation.js

const Joi = require("joi");

const PURPOSE_ENUM = [
  "general",
  "scholarship",
  "infrastructure",
  "event",
  "community",
];

const STATUS_ENUM = ["success", "pending", "failed"];

const createDonation = {
  body: Joi.object({
    amount: Joi.number()
      .positive()
      .min(10)
      .max(10_00_000)
      .required()
      .messages({
        "number.base": "Amount must be a number",
        "number.min": "Minimum donation amount is ₹10",
        "number.max": "Donation amount is too large",
        "any.required": "Amount is required",
      }),
    purpose: Joi.string()
      .valid(...PURPOSE_ENUM)
      .required()
      .messages({
        "any.only": `Purpose must be one of: ${PURPOSE_ENUM.join(", ")}`,
        "any.required": "Purpose is required",
      }),
    message: Joi.string().max(500).allow("", null),
    isAnonymous: Joi.boolean().default(false),
    paymentProvider: Joi.string()
      .valid("manual", "razorpay", "upi", "bank_transfer", "stripe", "other")
      .default("manual")
      .optional(),
    currency: Joi.string().default("INR"),
    meta: Joi.object().unknown(true).optional(),
  }),
};

const verifyDonation = {
  body: Joi.object({
    transactionId: Joi.string().trim().required().messages({
      "any.required": "transactionId is required for verification",
      "string.empty": "transactionId cannot be empty",
    }),
    status: Joi.string()
      .valid(...STATUS_ENUM)
      .default("success"),
    meta: Joi.object().unknown(true).optional(),
  }),
};

module.exports = {
  createDonation,
  verifyDonation,
};
