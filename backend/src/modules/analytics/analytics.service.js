const User = require("../user/user.model");
const Feed = require("../feed/feed.model");
const Job = require("../jobs/job.model");
const Event = require("../events/event.model");
const Community = require("../communities/community.model");
const Donation = require("../donations/donation.model");

/**
 * 🧠 1) OVERVIEW STATS
 * Used in: AdminDashboardPage → top stat cards
 */
exports.getOverview = async () => {
  const [
    totalUsers,
    totalStudents,
    totalAlumni,
    totalFaculty,
    totalPosts,
    totalJobs,
    jobsApproved,
    jobsPending,
    totalEvents,
    eventsApproved,
    eventsPending,
    totalCommunities,
    donationsAgg,
    activeToday,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "alumni" }),
    User.countDocuments({ role: "faculty" }),

    Feed.countDocuments(),

    Job.countDocuments(),
    Job.countDocuments({ approved: true }),
    Job.countDocuments({ approved: false }),

    Event.countDocuments(),
    Event.countDocuments({ approved: true }),
    Event.countDocuments({ approved: false }),

    Community.countDocuments(),

    Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
        },
      },
    ]),

    // lastActive optional hai – agar field nahi hogi to result 0 aayega (no crash)
    User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);

  const donationsSummary = donationsAgg[0] || {
    totalAmount: 0,
    totalCount: 0,
  };

  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      alumni: totalAlumni,
      faculty: totalFaculty,
      activeToday,
    },
    content: {
      posts: totalPosts,
      communities: totalCommunities,
    },
    jobs: {
      total: totalJobs,
      approved: jobsApproved,
      pending: jobsPending,
    },
    events: {
      total: totalEvents,
      approved: eventsApproved,
      pending: eventsPending,
    },
    donations: {
      totalAmount: donationsSummary.totalAmount,
      totalCount: donationsSummary.totalCount,
    },
  };
};

/**
 * 📊 2) USER ANALYTICS
 * - role-wise distribution
 * - monthly signups (for line chart)
 */
exports.userStats = async () => {
  const [byRole, monthlySignups] = await Promise.all([
    // Role-wise user count
    User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // Monthly signups trend
    User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]),
  ]);

  return {
    byRole,
    monthlySignups,
  };
};

/**
 * 💼 3) JOB ANALYTICS
 * - total / approved / pending
 * - posting source distribution (by postedByRole if you store it)
 * - applications per job (safe even if applications field missing)
 */
exports.jobStats = async () => {
  const [counts, postedByRole, applicationsPerJob] = await Promise.all([
    (async () => {
      const [total, approved, pending] = await Promise.all([
        Job.countDocuments(),
        Job.countDocuments({ approved: true }),
        Job.countDocuments({ approved: false }),
      ]);
      return { total, approved, pending };
    })(),

    // Group by posting role if you store something like `postedByRole`
    Job.aggregate([
      {
        $group: {
          _id: "$postedByRole", // if field missing → _id: null group (no crash)
          count: { $sum: 1 },
        },
      },
    ]),

    // Applications per job (assuming `applications` is an array)
    Job.aggregate([
      {
        $project: {
          title: 1,
          applicationsCount: {
            $size: { $ifNull: ["$applications", []] },
          },
        },
      },
      { $sort: { applicationsCount: -1 } },
      { $limit: 10 }, // top 10 jobs by applications
    ]),
  ]);

  return {
    ...counts,
    postedByRole,
    topJobsByApplications: applicationsPerJob,
  };
};

/**
 * 📅 4) EVENT ANALYTICS
 * - total / approved / pending
 * - monthly events
 * - top events by registrations (assuming registrations array)
 */
exports.eventStats = async () => {
  const [counts, monthlyEvents, topEvents] = await Promise.all([
    (async () => {
      const [total, approved, pending] = await Promise.all([
        Event.countDocuments(),
        Event.countDocuments({ approved: true }),
        Event.countDocuments({ approved: false }),
      ]);
      return { total, approved, pending };
    })(),

    // Monthly events created
    Event.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]),

    // Top events by registrations (assuming `registrations` array)
    Event.aggregate([
      {
        $project: {
          title: 1,
          registrationsCount: {
            $size: { $ifNull: ["$registrations", []] },
          },
        },
      },
      { $sort: { registrationsCount: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    ...counts,
    monthlyEvents,
    topEvents,
  };
};

/**
 * 👥 5) COMMUNITY ANALYTICS
 * - total communities
 * - top communities by members
 */
exports.communityStats = async () => {
  const [totalCommunities, topCommunities] = await Promise.all([
    Community.countDocuments(),

    Community.aggregate([
      {
        $project: {
          name: 1,
          membersCount: {
            $size: { $ifNull: ["$members", []] }, // members: [userId]
          },
        },
      },
      { $sort: { membersCount: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    total: totalCommunities,
    topCommunities,
  };
};

/**
 * 📰 6) FEED / POSTS ANALYTICS
 * - total posts
 * - posts per day (for last 30 days)
 */
exports.feedStats = async () => {
  const [totalPosts, postsPerDay] = await Promise.all([
    Feed.countDocuments(),

    // Last 30 days posts per day
    Feed.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ]),
  ]);

  return {
    totalPosts,
    postsPerDay,
  };
};

/**
 * 📚 7) LEARNING ANALYTICS
 * Aabhi light return — future me agar Learning ke liye model add karoge,
 * to yahan aggregation add kar sakte ho.
 */
exports.learningStats = async () => {
  // Placeholder structure so frontend safely consume kar sake
  return {
    totalResources: 0,
    totalEnrolments: 0,
    popularSkills: [],
    // later: add actual aggregations when learning model finalize ho
  };
};

/**
 * 💰 8) DONATION / FUNDRAISING ANALYTICS
 * - total amount
 * - total donations
 * - monthly donations (for charts)
 * - top donors (if `donorName` or `donor` available)
 */
exports.donationStats = async () => {
  const [summaryAgg, monthlyAgg, topDonors] = await Promise.all([
    Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
        },
      },
    ]),

    Donation.aggregate([
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
    ]),

    // Top donors – safe even if donorName missing
    Donation.aggregate([
      {
        $group: {
          _id: "$donorName", // ya `$donor` depending on your schema
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const summary = summaryAgg[0] || {
    totalAmount: 0,
    totalCount: 0,
  };

  return {
    totalAmount: summary.totalAmount,
    totalCount: summary.totalCount,
    monthly: monthlyAgg,
    topDonors,
  };
};
