// backend/src/modules/events/event.controller.js
const catchAsync = require("../../utils/catchAsync");
const eventService = require("./event.service");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

/**
 * CREATE EVENT
 * Accepts multipart/form-data (banner optional)
 * Body fields validated by createEventSchema
 */
exports.createEvent = catchAsync(async (req, res, next) => {
  // banner can come from multer+cloudinary middleware
  const bannerUrl = req.file?.cloudinary?.url || req.body?.banner || null;

  // Build payload from req.body + banner
  const payload = {
    // spread validated body (validate middleware already sanitized req.body)
    ...req.body,
    banner: bannerUrl,
  };

  const creatorId = req.user?.id || req.user?._id;
  if (!creatorId) throw new ApiError(401, "Not authenticated");

  const event = await eventService.createEvent(payload, creatorId);

  return res.status(201).json(
    new ApiResponse(
      201,
      "Event created successfully. Pending approval.",
      event
    )
  );
});

/**
 * PUBLIC EVENTS (NO AUTH)
 * Shows only approved & upcoming events
 */
exports.getPublicEvents = catchAsync(async (req, res) => {
  const events = await eventService.getEvents({ onlyApproved: true });
  return res.json(new ApiResponse(200, "Public events fetched", events));
});

/**
 * USER EVENTS (AUTH) — list events (approved/upcoming)
 */
exports.getEvents = catchAsync(async (req, res) => {
  const events = await eventService.getEvents({ onlyApproved: true });
  return res.json(new ApiResponse(200, "Events fetched", events));
});

/**
 * EVENT DETAILS
 */
exports.getEventDetails = catchAsync(async (req, res) => {
  const event = await eventService.getEventDetails(req.params.id);
  if (!event) throw new ApiError(404, "Event not found");
  return res.json(new ApiResponse(200, "Event details fetched", event));
});

/**
 * REGISTER FOR EVENT
 */
exports.registerEvent = catchAsync(async (req, res) => {
  const updated = await eventService.registerEvent(req.params.id, req.user.id);
  return res.json(new ApiResponse(200, "Successfully registered for event", updated));
});

/**
 * CANCEL EVENT
 */
exports.cancelEvent = catchAsync(async (req, res) => {
  const cancelled = await eventService.cancelEvent(req.params.id, req.user.id);
  return res.json(new ApiResponse(200, "Event cancelled successfully", cancelled));
});

/**
 * UPDATE EVENT
 * Accepts multipart/form-data (optional banner)
 */
exports.updateEvent = catchAsync(async (req, res) => {
  // If banner was uploaded, prefer that; else allow banner field in req.body
  const bannerUrl = req.file?.cloudinary?.url || req.body?.banner || null;

  // Merge banner into update payload
  const payload = {
    ...req.body,
  };
  if (bannerUrl) payload.banner = bannerUrl;

  const updated = await eventService.updateEvent(req.params.id, req.user.id, payload);

  return res.json(new ApiResponse(200, "Event updated successfully", updated));
});

/**
 * APPROVE EVENT (admin)
 */
exports.approveEvent = catchAsync(async (req, res) => {
  const approved = await eventService.approveEvent(req.params.id);
  return res.json(new ApiResponse(200, "Event approved", approved));
});
