const service = require("./admin.service");

/* USERS */
exports.getUsers = async (req, res, next) => {
  const data = await service.getAllUsers();
  res.json({ success: true, data });
};

exports.changeUserRole = async (req, res, next) => {
  const data = await service.updateUserRole(req.params.id, req.body.role);
  res.json({ success: true, data });
};

/* JOBS */
exports.pendingJobs = async (req, res, next) => {
  const data = await service.getPendingJobs();
  res.json({ success: true, data });
};

exports.approveJob = async (req, res, next) => {
  const data = await service.approveJob(req.params.id);
  res.json({ success: true, data });
};

/* EVENTS */
exports.pendingEvents = async (req, res, next) => {
  const data = await service.getPendingEvents();
  res.json({ success: true, data });
};

exports.approveEvent = async (req, res, next) => {
  const data = await service.approveEvent(req.params.id);
  res.json({ success: true, data });
};

/* ANALYTICS */
exports.analytics = async (req, res, next) => {
  const data = await service.getAnalytics();
  res.json({ success: true, data });
};
