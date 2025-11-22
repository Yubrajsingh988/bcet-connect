const mongoSanitize = require("express-mongo-sanitize");
app.use((req, res, next) => {
  try {
    return mongoSanitize()(req, res, next);
  } catch (e) {
    // fallback to safe sanitizer
    return sanitizeInputs(req, res, next);
  }
});
