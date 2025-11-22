// backend/src/modules/donations/donation.analytics.js

const Donation = require("./donation.model");

/**
 * Helper for createdAt range
 */
const buildDateRangeMatch = (fromDate, toDate) => {
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
 * Overview for admin dashboard cards
 */
const donationOverview = async ({ fromDate, toDate } = {}) => {
  const dateMatch = buildDateRangeMatch(fromDate, toDate);
  const matchStage = { status: "success", ...dateMatch };

  const [result] = await Donation.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalDonations: { $sum: 1 },
        uniqueDonorsSet: { $addToSet: "$user" },
        minAmount: { $min: "$amount" },
        maxAmount: { $max: "$amount" },
        avgAmount: { $avg: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        totalAmount: 1,
        totalDonations: 1,
        minAmount: 1,
        maxAmount: 1,
        avgAmount: { $ifNull: ["$avgAmount", 0] },
        uniqueDonors: { $size: "$uniqueDonorsSet" },
      },
    },
  ]);

  return (
    result || {
      totalAmount: 0,
      totalDonations: 0,
      uniqueDonors: 0,
      minAmount: 0,
      maxAmount: 0,
      avgAmount: 0,
    }
  );
};

/**
 * Purpose-wise breakdown (for pie chart)
 */
const donationPurposeBreakdown = async ({ fromDate, toDate } = {}) => {
  const dateMatch = buildDateRangeMatch(fromDate, toDate);
  const matchStage = { status: "success", ...dateMatch };

  const data = await Donation.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$purpose",
        totalAmount: { $sum: "$amount" },
        donationCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        purpose: "$_id",
        totalAmount: 1,
        donationCount: 1,
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  return data;
};

/**
 * Monthly trend (for line chart)
 */
const donationMonthlyTrend = async ({ fromDate, toDate } = {}) => {
  let dateMatch = {};

  if (fromDate || toDate) {
    dateMatch = buildDateRangeMatch(fromDate, toDate);
  } else {
    const now = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(now.getFullYear() - 1);
    dateMatch = { createdAt: { $gte: lastYear, $lte: now } };
  }

  const matchStage = { status: "success", ...dateMatch };

  const data = await Donation.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalAmount: { $sum: "$amount" },
        donationCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        totalAmount: 1,
        donationCount: 1,
        label: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: [
                { $lt: ["$_id.month", 10] },
                { $concat: ["0", { $toString: "$_id.month" }] },
                { $toString: "$_id.month" },
              ],
            },
          ],
        },
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  return data;
};

/**
 * Top donors (non-anonymous)
 */
const donationTopDonors = async ({ fromDate, toDate, limit = 10 } = {}) => {
  const dateMatch = buildDateRangeMatch(fromDate, toDate);
  const matchStage = {
    status: "success",
    isAnonymous: false,
    ...dateMatch,
  };

  const data = await Donation.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$user",
        totalAmount: { $sum: "$amount" },
        donationCount: { $sum: 1 },
        lastDonationAt: { $max: "$createdAt" },
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
        role: "$user.role",
        avatar: "$user.avatar",
        totalAmount: 1,
        donationCount: 1,
        lastDonationAt: 1,
      },
    },
  ]);

  return data;
};

/**
 * Compact summary for main analytics module
 */
const donationSummaryForAnalytics = async () => {
  const overview = await donationOverview();
  const byPurpose = await donationPurposeBreakdown();
  return { overview, byPurpose };
};

module.exports = {
  donationOverview,
  donationPurposeBreakdown,
  donationMonthlyTrend,
  donationTopDonors,
  donationSummaryForAnalytics,
};
