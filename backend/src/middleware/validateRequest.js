// backend/src/middleware/validateRequest.js
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

/**
 * validateRequest(schema, [options])
 *
 * schema may be:
 *  - a Joi schema (direct): validateRequest(JoiSchema)
 *  - an object: { body: JoiBodySchema, params: JoiParamsSchema, query: JoiQuerySchema }
 *
 * options (optional) may include:
 *  - abortEarly (default false)
 *  - stripUnknown (default true)
 *
 * Sets req.validated = { body, params, query } with validated values (or original if no schema)
 */
module.exports = (schema, options = {}) => {
  const defaultOpts = { abortEarly: false, stripUnknown: true };
  const opts = { ...defaultOpts, ...(options || {}) };

  return async (req, res, next) => {
    try {
      // If no schema provided, pass through
      if (!schema) {
        req.validated = { body: req.body, params: req.params, query: req.query };
        return next();
      }

      let validatedBody = req.body;
      let validatedParams = req.params;
      let validatedQuery = req.query;

      // If schema is a Joi schema directly (has validateAsync)
      if (typeof schema?.validateAsync === "function") {
        // validate req.body (works also for form-data fields)
        validatedBody = await schema.validateAsync(req.body || {}, opts);
      } else {
        // schema is expected to be an object { body, params, query }
        if (schema.body && typeof schema.body.validateAsync === "function") {
          validatedBody = await schema.body.validateAsync(req.body || {}, opts);
        }

        if (schema.params && typeof schema.params.validateAsync === "function") {
          validatedParams = await schema.params.validateAsync(req.params || {}, opts);
        }

        if (schema.query && typeof schema.query.validateAsync === "function") {
          validatedQuery = await schema.query.validateAsync(req.query || {}, opts);
        }
      }

      // attach validated values so controllers can use req.validated.*
      req.validated = {
        body: validatedBody,
        params: validatedParams,
        query: validatedQuery,
      };

      // override req.body/params/query with cleaned values (useful)
      req.body = validatedBody;
      req.params = validatedParams;
      req.query = validatedQuery;

      return next();
    } catch (err) {
      // Joi error shape: err.isJoi and err.details array
      const messages = Array.isArray(err?.details)
        ? err.details.map((d) => d.message)
        : [err?.message || "Invalid request"];

      // Log in non-production for debugging
      if (process.env.NODE_ENV !== "production") {
        logger.warn("Validation error", { messages, path: req.originalUrl });
        // also console for quick local dev
        // eslint-disable-next-line no-console
        console.error("❌ Validation Error:", messages);
      } else {
        logger.warn("Validation error (prod)", { path: req.originalUrl });
      }

      return next(new ApiError(400, messages.join(", ")));
    }
  };
};
