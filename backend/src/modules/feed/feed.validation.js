// backend/src/modules/feed/feed.validation.js

const Joi = require("joi");

/* ──────────────────────────────────────────────
   CREATE POST (NO MEDIA HERE ❗)
─────────────────────────────────────────────── */
exports.createPostSchema = Joi.object({
  text: Joi.string()
    .trim()
    .max(3000)
    .allow("", null),

  type: Joi.string()
    .valid(
      "USER",
      "COMMUNITY",
      "MENTOR",
      "ADMIN",
      "JOB_CARD",
      "EVENT_CARD"
    )
    .default("USER"),

  visibility: Joi.string()
    .valid("FOLLOWERS", "COMMUNITY", "PUBLIC")
    .default("FOLLOWERS"),

  community: Joi.string()
    .hex()
    .length(24)
    .optional(),

  refId: Joi.string()
    .hex()
    .length(24)
    .optional(),
});

/* ──────────────────────────────────────────────
   ADD COMMENT
─────────────────────────────────────────────── */
exports.addCommentSchema = Joi.object({
  text: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required(),
});

/* ──────────────────────────────────────────────
   GET FEED QUERY
─────────────────────────────────────────────── */
exports.getFeedQuerySchema = Joi.object({
  type: Joi.string()
    .valid(
      "USER",
      "COMMUNITY",
      "MENTOR",
      "ADMIN",
      "JOB_CARD",
      "EVENT_CARD",
      "ALL"
    )
    .default("ALL"),

  limit: Joi.number()
    .min(1)
    .max(50)
    .default(20),
});
