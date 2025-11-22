// backend/src/modules/events/event.service.js

const Event = require("./event.model");
const ApiError = require("../../utils/ApiError");

// ----------------------- CREATE EVENT -----------------------
exports.createEvent = async (data, userId) => {
  return Event.create({
    ...data,
    createdBy: userId,
    approved: false, // Admin approval required
    isDeleted: false,
  });
};

// ----------------------- PUBLIC EVENTS (NO AUTH) -----------------------
// Landing / public section ke liye – only approved + upcoming + not deleted
exports.getPublicEvents = async () => {
  const now = new Date();

  return Event.find({
    approved: true,
    isDeleted: false,
    date: { $gte: now }, // sirf future ya today ke events
  })
    .select("title date location category banner createdAt")
    .sort({ date: 1 });
};

// ----------------------- EVENTS FOR LOGGED USERS -----------------------
exports.getEvents = async (filters = {}) => {
  const now = new Date();

  const query = {
    approved: true,
    isDeleted: false,
  };

  // optional filters
  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.upcoming) {
    query.date = { $gte: now };
  }

  return Event.find(query)
    .populate("createdBy", "name avatar role")
    .sort({ date: 1 });
};

// ----------------------- EVENT DETAILS -----------------------
exports.getEventDetails = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate("createdBy", "name avatar role")
    .populate("registeredUsers", "name avatar role");

  if (!event) throw new ApiError(404, "Event not found");

  if (event.isDeleted) {
    throw new ApiError(410, "This event is no longer available");
  }

  return event;
};

// ----------------------- REGISTER FOR EVENT -----------------------
exports.registerEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);

  if (!event) throw new ApiError(404, "Event not found");
  if (!event.approved) throw new ApiError(403, "Event not approved yet");
  if (event.isDeleted) throw new ApiError(400, "Event has been removed");

  // Deadline check
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    throw new ApiError(400, "Registration deadline has passed");
  }

  // Capacity check
  if (
    typeof event.capacity === "number" &&
    event.registeredUsers.length >= event.capacity
  ) {
    throw new ApiError(400, "Event capacity is full");
  }

  const alreadyRegistered = event.registeredUsers.some(
    (id) => id.toString() === userId.toString()
  );

  if (alreadyRegistered) {
    throw new ApiError(400, "You are already registered for this event");
  }

  event.registeredUsers.push(userId);
  await event.save();

  return event;
};

// ----------------------- CANCEL EVENT (SOFT DELETE) -----------------------
exports.cancelEvent = async (eventId, user) => {
  const event = await Event.findById(eventId);

  if (!event) throw new ApiError(404, "Event not found");

  const isCreator =
    event.createdBy.toString() === user.id.toString() ||
    event.createdBy.toString() === user._id?.toString();

  const isAdmin = user.role === "admin" || user.role === "superadmin";

  if (!isCreator && !isAdmin) {
    throw new ApiError(403, "You are not allowed to cancel this event");
  }

  event.isDeleted = true;
  await event.save();

  return event;
};

// ----------------------- APPROVE EVENT (ADMIN) -----------------------
exports.approveEvent = async (eventId) => {
  const event = await Event.findByIdAndUpdate(
    eventId,
    { approved: true },
    { new: true }
  );

  if (!event) throw new ApiError(404, "Event not found");
  return event;
};

// ----------------------- FILTER EVENTS (for future use / analytics) -----------------------
exports.filterEvents = async ({ category, upcoming } = {}) => {
  const now = new Date();
  const query = { approved: true, isDeleted: false };

  if (category) query.category = category;
  if (upcoming) query.date = { $gte: now };

  return Event.find(query).sort({ date: 1 });
};
