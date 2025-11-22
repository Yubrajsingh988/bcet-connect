// backend/src/modules/jobs/job.controller.js

const catchAsync = require("../../utils/catchAsync");
const jobService = require("./job.service");

/**
 * POST A NEW JOB
 * Only allowed roles can post (handled by middleware)
 */
exports.postJob = catchAsync(async (req, res) => {
  const job = await jobService.postJob(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Job posted successfully",
    data: job,
  });
});

/**
 * GET ALL JOBS (With filters)
 * Students → Only approved jobs
 * Admin/Creators → Show their own unapproved as well
 */
exports.getJobs = catchAsync(async (req, res) => {
  const { search, type, location, page = 1, limit = 20 } = req.query;

  const jobs = await jobService.getJobs({
    search,
    type,
    location,
    page,
    limit,
    role: req.user.role,
    userId: req.user.id,
  });

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

/**
 * GET SINGLE JOB DETAILS
 */
exports.getJobDetails = catchAsync(async (req, res) => {
  const job = await jobService.getJobDetails(req.params.id);

  res.status(200).json({
    success: true,
    data: job,
  });
});

/**
 * APPLY TO JOB
 */
exports.applyJob = catchAsync(async (req, res) => {
  const job = await jobService.applyJob(
    req.params.id,
    req.user.id,
    req.body.resume // URL
  );

  res.status(200).json({
    success: true,
    message: "Applied successfully",
    data: job,
  });
});
