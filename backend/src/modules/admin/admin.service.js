const User = require("../user/user.model");
const Job = require("../jobs/job.model");
const Event = require("../events/event.model");

/* USERS */
exports.getAllUsers = async () => {
  return User.find().select("name email role avatar createdAt");
};

exports.updateUserRole = async (userId, role) => {
  return User.findByIdAndUpdate(userId, { role }, { new: true });
};

/* JOB APPROVAL */
exports.getPendingJobs = async () => {
  return Job.find({ approved: false }).populate("postedBy", "name email role");
};

exports.approveJob = async (jobId) => {
  return Job.findByIdAndUpdate(jobId, { approved: true }, { new: true });
};

/* EVENT APPROVAL */
exports.getPendingEvents = async () => {
  return Event.find({ approved: false }).populate("createdBy", "name email role");
};

exports.approveEvent = async (eventId) => {
  return Event.findByIdAndUpdate(eventId, { approved: true }, { new: true });
};

/* ANALYTICS */
exports.getAnalytics = async () => {
  return {
    totalUsers: await User.countDocuments(),
    totalAlumni: await User.countDocuments({ role: "alumni" }),
    totalStudents: await User.countDocuments({ role: "student" }),
    jobsApproved: await Job.countDocuments({ approved: true }),
    eventsApproved: await Event.countDocuments({ approved: true }),
  };
};
