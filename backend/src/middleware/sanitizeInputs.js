// backend/src/middleware/sanitizeInputs.js
/**
 * Safe in-place input sanitizer that removes Mongo operator keys (keys starting with "$")
 * and dotted keys (containing ".") from objects.
 *
 * It MUTATES objects instead of replacing them, so it avoids the "getter-only" problem.
 */

const isPlainObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date);

const shouldRemoveKey = (key) => {
  if (!key || typeof key !== "string") return false;
  if (key.startsWith("$")) return true; // mongo operator
  if (key.includes(".")) return true; // dotted key
  return false;
};

function sanitizeObjectInPlace(obj) {
  if (!isPlainObject(obj)) return obj;

  for (const key of Object.keys(obj)) {
    const val = obj[key];

    // Remove dangerous keys
    if (shouldRemoveKey(key)) {
      try {
        delete obj[key];
      } catch (e) {
        try {
          obj[key] = undefined;
        } catch (er) {
          // ignore
        }
      }
      continue;
    }

    // Recurse into arrays / objects
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (isPlainObject(val[i])) sanitizeObjectInPlace(val[i]);
      }
    } else if (isPlainObject(val)) {
      sanitizeObjectInPlace(val);
    }
  }

  return obj;
}

module.exports = (req, res, next) => {
  try {
    if (req.body && typeof req.body === "object") sanitizeObjectInPlace(req.body);
    if (req.params && typeof req.params === "object") sanitizeObjectInPlace(req.params);
    if (req.query && typeof req.query === "object") sanitizeObjectInPlace(req.query);
    return next();
  } catch (err) {
    return next(err);
  }
};
