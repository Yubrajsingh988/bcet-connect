// backend/src/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User = require("../modules/user/user.model");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization token missing"));
  }

  const token = authHeader.split(" ")[1];

  try {
    // 🔹 Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return next(new ApiError(403, "Invalid token: User ID missing"));
    }

    // 🔹 Fetch fresh user from DB (better security)
    const user = await User.findById(decoded.id).select(
      "_id name email role avatar"
    );

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // 🔥 FINAL STRUCTURE → Controller SAFE
    req.user = {
      _id: user._id,
      id: user._id, // backward compatibility
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    // Debug log (optional)
    console.log("🔐 AUTH SUCCESS →", {
      id: req.user._id.toString(),
      role: req.user.role,
    });

    next();
  } catch (err) {
    console.error("❌ JWT ERROR →", err.message);
    return next(new ApiError(401, "Invalid or expired token"));
  }
};
