// backend/src/utils/resposeHelper.js

exports.success = (res, data, message = "Success") => {
  return res.json({ success: true, message, data });
};

exports.error = (res, message = "Error", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
