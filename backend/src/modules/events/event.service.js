// backend/src/modules/events/event.service.js

const mongoose = require("mongoose");
const Event = require("./event.model");
const ApiError = require("../../utils/ApiError");

const { isValidObjectId } = mongoose;

/**
 * CREATE EVENT
 * - data: object (validated by controller/validate middleware)
 * - userId: creator id (string or ObjectId)
 */
exports.createEvent = async (data = {}, userId) => {
  if (!userId || !isValidObjectId(String(userId))) {
    throw new ApiError(401, "Invalid or missing creator id");
  }

  // Build safe payload (pick allowed fields)
  const allowed = [
    "title",
    "description",
    "date",
    "location",
    "category",
    "capacity",
    "registrationDeadline",
    "banner", // url
    "meta",
  ];

  const payload = { createdBy: userId, approved: false, isDeleted: false };

  for (const k of allowed) {
    if (data[k] !== undefined) payload[k] = data[k];
  }

  // Normalize date fields if passed as string
  if (payload.date) payload.date = new Date(payload.date);
  if (payload.registrationDeadline)
    payload.registrationDeadline = new Date(payload.registrationDeadline);

  const created = await Event.create(payload);
  // Return populated result for convenience
  return created.populate("createdBy", "name avatar role");
};

/**
 * PUBLIC EVENTS (no auth) — approved + upcoming + not deleted
 * Kept for backward compatibility
 */
exports.getPublicEvents = async () => {
  const now = new Date();
  return Event.find({
    approved: true,
    isDeleted: false,
    date: { $gte: now },
  })
    .select("title date location category banner createdAt")
    .sort({ date: 1 })
    .lean();
};

/**
 * GET EVENTS (for logged users) - flexible filter object:
 * filters = { onlyApproved: true|false, upcoming: true|false, category: "..." }
 */
exports.getEvents = async (filters = {}) => {
  const now = new Date();
  const query = { isDeleted: false };

  if (filters.onlyApproved === undefined || filters.onlyApproved === true) {
    query.approved = true;
  } else if (filters.onlyApproved === false) {
    // allow querying unapproved if explicitly requested (admin internal use)
    query.approved = false;
  }

  if (filters.upcoming) {
    query.date = { $gte: now };
  }

  if (filters.category) {
    query.category = filters.category;
  }

  const q = Event.find(query)
    .populate("createdBy", "name avatar role")
    .sort({ date: 1 });

  // Optionally apply pagination (future): skip/limit from filters
  if (filters.skip) q.skip(Number(filters.skip));
  if (filters.limit) q.limit(Number(filters.limit));

  return q.exec();
};

/**
 * EVENT DETAILS
 */
exports.getEventDetails = async (eventId) => {
  if (!isValidObjectId(String(eventId))) {
    throw new ApiError(400, "Invalid event id");
  }

  const event = await Event.findById(eventId)
    .populate("createdBy", "name avatar role")
    .populate("registeredUsers", "name avatar role");

  if (!event) throw new ApiError(404, "Event not found");

  if (event.isDeleted) {
    throw new ApiError(410, "This event is no longer available");
  }

  return event;
};

/**
 * REGISTER FOR EVENT
 */
exports.registerEvent = async (eventId, userId) => {
  if (!isValidObjectId(String(eventId))) throw new ApiError(400, "Invalid event id");
  if (!isValidObjectId(String(userId))) throw new ApiError(400, "Invalid user id");

  const event = await Event.findById(eventId);

  if (!event) throw new ApiError(404, "Event not found");
  if (!event.approved) throw new ApiError(403, "Event not approved yet");
  if (event.isDeleted) throw new ApiError(400, "Event has been removed");

  // Deadline check
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    throw new ApiError(400, "Registration deadline has passed");
  }

  // Capacity check (if capacity is a number)
  if (typeof event.capacity === "number" && event.registeredUsers.length >= event.capacity) {
    throw new ApiError(400, "Event capacity is full");
  }

  const alreadyRegistered = event.registeredUsers.some(
    (id) => id.toString() === String(userId)
  );

  if (alreadyRegistered) {
    throw new ApiError(400, "You are already registered for this event");
  }

  event.registeredUsers.push(userId);
  await event.save();

  // return populated event for convenience
  await event.populate("registeredUsers", "name avatar role");
  return event;
};

/**
 * CANCEL EVENT (soft delete)
 * - Only creator or admin/superadmin can cancel
 * - user param can be id string or user object { id/ _id, role }
 */
exports.cancelEvent = async (eventId, user) => {
  if (!isValidObjectId(String(eventId))) throw new ApiError(400, "Invalid event id");
  if (!user) throw new ApiError(401, "Not authenticated");

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  const userId = user.id || user._id || user;
  if (!isValidObjectId(String(userId))) throw new ApiError(400, "Invalid user id");

  const isCreator = event.createdBy.toString() === String(userId);
  const isAdmin = (user.role && (user.role === "admin" || user.role === "superadmin"));

  if (!isCreator && !isAdmin) {
    throw new ApiError(403, "You are not allowed to cancel this event");
  }

  event.isDeleted = true;
  event.cancelledAt = new Date();
  await event.save();

  return event;
};

/**
 * UPDATE EVENT
 * - Only creator or admin should be allowed (controller/role middleware enforces role,
 *   but we double-check creator when role is alumni/faculty)
 * - Accepts payload with allowed fields; banner can be updated via payload.banner
 */
exports.updateEvent = async (eventId, user, payload = {}) => {
  if (!isValidObjectId(String(eventId))) throw new ApiError(400, "Invalid event id");
  if (!user) throw new ApiError(401, "Not authenticated");

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");
  if (event.isDeleted) throw new ApiError(410, "Cannot update a removed event");

  const userId = user.id || user._id || user;
  const isCreator = event.createdBy.toString() === String(userId);
  const isAdmin = (user.role && (user.role === "admin" || user.role === "superadmin"));

  if (!isCreator && !isAdmin) {
    throw new ApiError(403, "You are not allowed to update this event");
  }

  const allowed = [
    "title",
    "description",
    "date",
    "location",
    "category",
    "capacity",
    "registrationDeadline",
    "banner",
    "meta",
  ];

  const updateObj = {};
  for (const k of allowed) {
    if (payload[k] !== undefined) updateObj[k] = payload[k];
  }

  if (updateObj.date) updateObj.date = new Date(updateObj.date);
  if (updateObj.registrationDeadline)
    updateObj.registrationDeadline = new Date(updateObj.registrationDeadline);

  const updated = await Event.findByIdAndUpdate(eventId, { $set: updateObj }, { new: true })
    .populate("createdBy", "name avatar role")
    .populate("registeredUsers", "name avatar role");

  return updated;
};

/**
 * APPROVE EVENT (admin)
 */
exports.approveEvent = async (eventId) => {
  if (!isValidObjectId(String(eventId))) throw new ApiError(400, "Invalid event id");

  const event = await Event.findByIdAndUpdate(eventId, { approved: true }, { new: true })
    .populate("createdBy", "name avatar role");

  if (!event) throw new ApiError(404, "Event not found");
  return event;
};

/**
 * FILTER EVENTS - useful for analytics / admin dashboards
 */
exports.filterEvents = async ({ category, upcoming } = {}) => {
  const now = new Date();
  const query = { approved: true, isDeleted: false };
  if (category) query.category = category;
  if (upcoming) query.date = { $gte: now };
  return Event.find(query).sort({ date: 1 });
};
