// backend/src/modules/donations/donation.controller.js

const { StatusCodes } = require("http-status-codes");
const donationService = require("./donation.service");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const logger = require("../../utils/logger");

/**
 * CREATE DONATION (ALUMNI)
 * POST /api/donations
 */
exports.createDonation = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  if (req.user.role !== "alumni") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only alumni can donate");
  }

  const payload = {
    userId: req.user.id,
    amount: req.body.amount,
    purpose: req.body.purpose,
    isAnonymous: req.body.isAnonymous ?? false,
    message: req.body.message || "",
    paymentProvider: req.body.paymentProvider || "manual",
    transactionId: req.body.transactionId || null,
    meta: req.body.meta || {},
  };

  logger.info("📌 Creating Donation Payload →", payload);

  const donation = await donationService.createDonation(payload);

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Donation created successfully",
    data: donation,
  });
});

/**
 * VERIFY DONATION (ADMIN / WEBHOOK)
 * POST /api/donations/verify
 */
exports.verifyDonation = catchAsync(async (req, res) => {
  const { transactionId, status = "success", meta } = req.body;

  if (!transactionId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "transactionId required");
  }

  const updated = await donationService.verifyDonation({
    transactionId,
    status,
    meta,
  });

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Donation not found");
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Donation verified successfully",
    data: updated,
  });
});

/**
 * GET MY DONATIONS (ALUMNI)
 * GET /api/donations/me
 */
exports.getMyDonations = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  const params = {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    purpose: req.query.purpose,
  };

  const result = await donationService.getDonationsByUser(req.user.id, params);

  return res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
});

/**
 * ADMIN: GET ALL DONATIONS
 * GET /api/donations
 */
exports.getAllDonations = catchAsync(async (req, res) => {
  const params = {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    purpose: req.query.purpose,
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
    search: req.query.search,
  };

  const result = await donationService.getAllDonations(params);

  return res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
});

/**
 * PUBLIC LEADERBOARD
 * GET /api/donations/leaderboard
 */
exports.getDonationLeaderboard = catchAsync(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const leaderboard = await donationService.getDonationLeaderboard({ limit });

  return res.status(StatusCodes.OK).json({
    success: true,
    data: leaderboard,
  });
});

/**
 * ADMIN STATS
 * GET /api/donations/stats
 */
exports.getDonationStats = catchAsync(async (req, res) => {
  const params = {
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
  };

  const stats = await donationService.getDonationStats(params);

  return res.status(StatusCodes.OK).json({
    success: true,
    data: stats,
  });
});
