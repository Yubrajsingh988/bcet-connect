// backend/src/modules/jobs/job.service.js

const Job = require("./job.model");
const ApiError = require("../../utils/ApiError");

/**
 * CREATE JOB (Pending Approval by default)
 */
exports.postJob = async (data, userId) => {
  return Job.create({
    ...data,
    postedBy: userId,
    isApproved: false, // IMPORTANT: matching schema
  });
};

/**
 * GET JOBS (Filter + Role-based visibility + Pagination)
 */
exports.getJobs = async ({
  search,
  type,
  location,
  page = 1,
  limit = 20,
  role,
  userId,
}) => {
  const query = {};

  // 🔹 Students → Only approved
  if (role === "student") query.isApproved = true;

  // 🔹 Alumni/Faculty → Show approved + their own posted but pending
  if (role === "alumni" || role === "faculty") {
    query.$or = [{ isApproved: true }, { postedBy: userId }];
  }

  // 🔹 Admin → See all jobs
  if (role === "admin") {
    // no approval filter
  }

  // 🔹 Search by title/company
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { company: new RegExp(search, "i") },
    ];
  }

  // 🔹 Filter by employment type
  if (type) query.employmentType = type;

  // 🔹 Filter by location
  if (location) query.location = new RegExp(location, "i");

  return Job.find(query)
    .populate("postedBy", "name avatar role")
    .sort({ createdAt: -1 }) // Latest first
    .skip((page - 1) * limit)
    .limit(limit);
};

/**
 * GET SINGLE JOB DETAILS
 */
exports.getJobDetails = async (jobId) => {
  const job = await Job.findById(jobId).populate(
    "postedBy",
    "name avatar role"
  );

  if (!job) throw new ApiError(404, "Job not found");
  return job;
};

/**
 * APPLY TO JOB
 */
exports.applyJob = async (jobId, userId, resumeUrl) => {
  const job = await Job.findById(jobId);

  if (!job) throw new ApiError(404, "Job not found");
  if (!job.isApproved) throw new ApiError(400, "Job not approved yet");

  const alreadyApplied = job.applicants.some(
    (app) => app.user.toString() === userId.toString()
  );

  if (alreadyApplied) throw new ApiError(400, "You already applied");

  job.applicants.push({
    user: userId,
    resume: resumeUrl,
  });

  await job.save();
  return job;
};
