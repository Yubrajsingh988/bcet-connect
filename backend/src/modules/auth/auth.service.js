// backend/src/modules/auth/auth.service.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
const ApiError = require("../../utils/ApiError");
const env = require("../../config/env"); // validates required envs at startup

const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } = env;

/**
 * Remove sensitive fields before sending user to client
 */
const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };

  delete user.password;
  delete user.refreshToken;
  delete user.__v;

  return user;
};

/**
 * Generate JWT access token
 * Throws ApiError(500) on misconfiguration.
 */
const generateAccessToken = (user) => {
  if (!JWT_SECRET) {
    throw new ApiError(500, "Server misconfiguration: JWT_SECRET is missing");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * @desc Register new user
 * @param {Object} data
 * @returns sanitized user
 */
exports.register = async (data) => {
  const { name, email, password, role } = data;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Check existing user (search by normalized email)
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(String(password), BCRYPT_SALT_ROUNDS);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });

  return sanitizeUser(user);
};

/**
 * @desc Login user with email/password
 * @param {Object} data
 * @returns { user, accessToken, token (legacy), expiresIn }
 */
exports.login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // generic msg to avoid enumeration
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(String(password), user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // generate token (accessToken)
  const accessToken = generateAccessToken(user);

  // update lastLogin (non-blocking could be used, but simple save is fine)
  try {
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
  } catch (e) {
    // don't block login for a minor logging failure
    // optionally log the error using your logger
  }

  const sanitized = sanitizeUser(user);

  // Return both accessToken and legacy token for backward compatibility
  return {
    user: sanitized,
    accessToken,
    token: accessToken, // legacy key — keep for older frontend
    expiresIn: JWT_EXPIRES_IN,
  };
};
