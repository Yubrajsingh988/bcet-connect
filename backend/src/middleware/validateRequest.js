// backend/src/middleware/validateRequest.js
const ApiError = require("../utils/ApiError");

module.exports = (schema) => async (req, res, next) => {
  try {
    // Agar schema direct Joi.object ho (schema.validateAsync exist)
    if (schema && typeof schema.validateAsync === "function") {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      req.body = value;
      return next();
    }

    // Agar schema body/params/query ke form me ho (jobs, events, etc.)
    if (schema?.body) {
      req.body = await schema.body.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
    }

    if (schema?.params) {
      req.params = await schema.params.validateAsync(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });
    }

    if (schema?.query) {
      req.query = await schema.query.validateAsync(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
    }

    next();
  } catch (err) {
    const messages = err.details
      ? err.details.map((d) => d.message)
      : [err.message];

    if (process.env.NODE_ENV !== "production") {
      console.error("❌ Validation Error:", messages);
    }

    next(new ApiError(400, messages.join(", ")));
  }
};
