// backend/src/modules/donations/donation.service.js

const mongoose = require("mongoose");
const Donation = require("./donation.model");
const User = require("../user/user.model");
const logger = require("../../utils/logger");

/**
 * Build createdAt filter from fromDate / toDate
 */
const buildDateRangeFilter = (fromDate, toDate) => {
  const createdAt = {};
  if (fromDate) createdAt.$gte = new Date(fromDate);
  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    createdAt.$lte = end;
  }
  return Object.keys(createdAt).length ? { createdAt } : {};
};

/**
 * Pagination helper
 */
const parsePagination = ({ page, limit }) => {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);
  return { page: p, limit: l, skip: (p - 1) * l };
};

/**
 * Create donation (intent/manual)
 */
exports.createDonation = async (payload) => {
  const {
    userId,
    amount,
    purpose,
    isAnonymous = false,
    message = "",
    paymentProvider = "manual",
    transactionId = null,
    meta = {},
  } = payload;

  logger.info("📌 Creating donation →", payload);

  if (!userId) {
    logger.error("❌ userId missing in donation payload");
    throw new Error("userId is required in donation payload");
  }

  const donation = await Donation.create({
    user: new mongoose.Types.ObjectId(userId),
    amount,
    purpose,
    isAnonymous,
    message,
    paymentProvider,
    transactionId,
    meta,
    // status: default "pending"
  });

  await donation.populate("user", "name email avatar role");

  logger.info("🟢 Donation Saved →", donation._id.toString());

  return donation;
};

/**
 * Verify/update donation status via transactionId
 */
exports.verifyDonation = async ({ transactionId, status = "success", meta }) => {
  const update = { status };
  if (meta) update.meta = meta;

  const donation = await Donation.findOneAndUpdate(
    { transactionId },
    { $set: update },
    { new: true }
  ).populate("user", "name email avatar role");

  return donation;
};

/**
 * Alumni: Get my donations (with pagination + filters)
 */
exports.getDonationsByUser = async (
  userId,
  { page, limit, status, purpose } = {}
) => {
  const { page: p, limit: l, skip } = parsePagination({ page, limit });

  const filter = { user: userId };
  if (status) filter.status = status;
  if (purpose) filter.purpose = purpose;

  const [items, total] = await Promise.all([
    Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
    Donation.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
};

/**
 * Admin: Get all donations (filters + pagination + search)
 */
exports.getAllDonations = async ({
  page,
  limit,
  status,
  purpose,
  fromDate,
  toDate,
  search,
} = {}) => {
  const { page: p, limit: l, skip } = parsePagination({ page, limit });

  const filter = {};
  if (status) filter.status = status;
  if (purpose) filter.purpose = purpose;
  Object.assign(filter, buildDateRangeFilter(fromDate, toDate));

  let query = Donation.find(filter).populate("user", "name email avatar role");

  // text search on user name/email
  if (search) {
    const regex = new RegExp(search, "i");
    const matchedUsers = await User.find({
      $or: [{ name: regex }, { email: regex }],
    }).select("_id");

    const userIds = matchedUsers.map((u) => u._id);

    if (!userIds.length) {
      return {
        items: [],
        meta: {
          total: 0,
          page: p,
          limit: l,
          totalPages: 1,
        },
      };
    }

    filter.user = { $in: userIds };
    query = Donation.find(filter).populate("user", "name email avatar role");
  }

  const [items, total] = await Promise.all([
    query.sort({ createdAt: -1 }).skip(skip).limit(l),
    Donation.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
};

/**
 * Leaderboard: top donors (successful only)
 */
exports.getDonationLeaderboard = async ({ limit = 10 } = {}) => {
  const pipeline = [
    { $match: { status: "success" } },
    {
      $group: {
        _id: "$user",
        totalAmount: { $sum: "$amount" },
        donationsCount: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        name: "$user.name",
        email: "$user.email",
        avatar: "$user.avatar",
        role: "$user.role",
        totalAmount: 1,
        donationsCount: 1,
      },
    },
  ];

  return Donation.aggregate(pipeline);
};

/**
 * Stats for admin charts
 */
exports.getDonationStats = async ({ fromDate, toDate } = {}) => {
  const match = { status: "success", ...buildDateRangeFilter(fromDate, toDate) };

  // Summary
  const [summary] = await Donation.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalDonations: { $sum: 1 },
      },
    },
  ]);

  // Purpose-wise breakdown
  const byPurpose = await Donation.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$purpose",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        purpose: "$_id",
        totalAmount: 1,
        count: 1,
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  // Monthly trend
  const monthly = await Donation.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        totalAmount: 1,
        count: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  return {
    totalAmount: summary?.totalAmount || 0,
    totalDonations: summary?.totalDonations || 0,
    byPurpose,
    monthly,
  };
};
