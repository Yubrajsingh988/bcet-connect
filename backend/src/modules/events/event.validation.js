// backend/src/modules/events/event.validation.js
const Joi = require("joi");

const objectId = Joi.string()
  .length(24)
  .hex()
  .message("Invalid id format")
  .required();

// Allowed categories (keeps parity with event.model enum)
const CATEGORIES = [
  "tech",
  "non-tech",
  "sports",
  "cultural",
  "community",
  "general",
  "workshop",
  "seminar",
  "placement",
];

// Common ISO date validator (string accepted if ISO)
const isoDate = Joi.date().iso().messages({
  "date.format": "Date must be in ISO 8601 format (e.g. 2025-12-31T18:30:00Z)",
  "date.base": "Invalid date format",
});

/**
 * CREATE EVENT
 *
 * Expected payload (body):
 * {
 *   title: string,
 *   description: string,
 *   date: ISO datetime string (required) -> event date & time,
 *   registrationDeadline: ISO datetime string (optional),
 *   location: string,
 *   banner: uri (optional),
 *   category: one of allowed categories,
 *   capacity: integer (optional)
 * }
 *
 * Business rules enforced:
 * - date must be in the future
 * - if registrationDeadline provided, it must be before the event date
 */
exports.createEventSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(3).max(200).required().messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters",
    }),

    description: Joi.string().trim().min(20).required().messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 20 characters",
    }),

    // event date-time (ISO). Frontend should send combined datetime (e.g. 2025-12-31T18:30:00Z)
    date: isoDate.required().greater("now").messages({
      "date.greater": "Event date must be in the future",
      "any.required": "Event date is required",
    }),

    // optional registration deadline (must be before event date, validated in .custom below)
    registrationDeadline: isoDate.optional().messages({
      "date.base": "Invalid registration deadline format",
    }),

    // location string (can be "Online - Zoom" etc.)
    location: Joi.string().trim().min(2).max(300).required().messages({
      "string.empty": "Location is required",
    }),

    // banner image URL (optional) — if you use upload middleware, controller will override with cloudinary url
    banner: Joi.string().uri().allow("", null).optional().messages({
      "string.uri": "Banner must be a valid URL",
    }),

    category: Joi.string()
      .valid(...CATEGORIES)
      .default("general")
      .messages({ "any.only": "Invalid category" }),

    capacity: Joi.number().integer().min(1).max(100000).optional().messages({
      "number.base": "Capacity must be a number",
      "number.min": "Capacity must be at least 1",
    }),

    // optional metadata object (freeform)
    meta: Joi.object().optional(),
  })
    .custom((value, helpers) => {
      // If registrationDeadline exists, it must be earlier than date
      if (value.registrationDeadline) {
        const reg = new Date(value.registrationDeadline).getTime();
        const ev = new Date(value.date).getTime();
        if (isNaN(reg) || isNaN(ev)) {
          return helpers.error("any.invalid", {
            message: "Invalid date or registrationDeadline",
          });
        }
        if (reg >= ev) {
          return helpers.error("any.invalid", {
            message: "registrationDeadline must be before the event date",
          });
        }
      }
      return value;
    }, "registrationDeadline vs date validation")
    .messages({
      "any.invalid": "{{#message}}",
    }),
};

/**
 * REGISTER EVENT - params { id }
 */
exports.registerEventSchema = {
  params: Joi.object({
    id: objectId,
  }),
};

/**
 * UPDATE EVENT
 *
 * - params.id required
 * - body can contain any of the updatable fields; at least one is required
 * - if date or registrationDeadline provided, they must be valid and consistent
 */
exports.updateEventSchema = {
  params: Joi.object({ id: objectId }),

  body: Joi.object({
    title: Joi.string().trim().min(3).max(200).optional(),
    description: Joi.string().trim().min(10).optional(),
    // accept ISO datetime if updating
    date: isoDate.optional().greater("now").messages({
      "date.greater": "Event date must be in the future",
    }),
    registrationDeadline: isoDate.optional(),
    location: Joi.string().trim().min(2).max(300).optional(),
    banner: Joi.string().uri().allow("", null).optional(),
    category: Joi.string().valid(...CATEGORIES).optional(),
    capacity: Joi.number().integer().min(1).max(100000).optional(),
    meta: Joi.object().optional(),
  })
    .min(1)
    .custom((value, helpers) => {
      // If both provided, ensure registrationDeadline < date
      if (value.registrationDeadline && value.date) {
        const reg = new Date(value.registrationDeadline).getTime();
        const ev = new Date(value.date).getTime();
        if (reg >= ev) {
          return helpers.error("any.invalid", {
            message: "registrationDeadline must be before the event date",
          });
        }
      }
      return value;
    }, "registrationDeadline vs date validation")
    .messages({
      "object.min": "At least one field must be provided to update",
      "any.invalid": "{{#message}}",
    }),
};

/**
 * APPROVE EVENT
 */
exports.approveEventSchema = {
  params: Joi.object({ id: objectId }),
};

/**
 * CANCEL EVENT
 */
exports.cancelEventSchema = {
  params: Joi.object({ id: objectId }),
};
