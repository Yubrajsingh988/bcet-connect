// backend/src/utils/ApiResponse.js
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static success(res, statusCode = 200, message = "Success", data = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, statusCode = 500, message = "Error", data = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      data,
    });
  }
}

module.exports = ApiResponse;
