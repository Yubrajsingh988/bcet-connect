// backend/src/modules/events/event.controller.js

const catchAsync = require("../../utils/catchAsync");
const eventService = require("./event.service");

// -------------------------------------------------
// CREATE EVENT
// -------------------------------------------------
exports.createEvent = catchAsync(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Event created successfully. Pending approval.",
    data: event,
  });
});

// -------------------------------------------------
// PUBLIC EVENTS (NO AUTH) — Show only approved + upcoming
// -------------------------------------------------
exports.getPublicEvents = catchAsync(async (req, res) => {
  const events = await eventService.getEvents({ onlyApproved: true });

  res.json({
    success: true,
    data: events,
  });
});

// -------------------------------------------------
// USER EVENTS (AUTH)
// -------------------------------------------------
exports.getEvents = catchAsync(async (req, res) => {
  const events = await eventService.getEvents({ onlyApproved: true });

  res.json({
    success: true,
    data: events,
  });
});

// -------------------------------------------------
// EVENT DETAILS
// -------------------------------------------------
exports.getEventDetails = catchAsync(async (req, res) => {
  const event = await eventService.getEventDetails(req.params.id);

  res.json({
    success: true,
    data: event,
  });
});

// -------------------------------------------------
// REGISTER FOR EVENT
// -------------------------------------------------
exports.registerEvent = catchAsync(async (req, res) => {
  const updated = await eventService.registerEvent(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Successfully registered for event",
    data: updated,
  });
});

// -------------------------------------------------
// CANCEL EVENT
// -------------------------------------------------
exports.cancelEvent = catchAsync(async (req, res) => {
  const cancelled = await eventService.cancelEvent(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Event cancelled successfully",
    data: cancelled,
  });
});

// -------------------------------------------------
// UPDATE EVENT
// -------------------------------------------------
exports.updateEvent = catchAsync(async (req, res) => {
  const updated = await eventService.updateEvent(
    req.params.id,
    req.user.id,
    req.body
  );

  res.json({
    success: true,
    message: "Event updated successfully",
    data: updated,
  });
});

// -------------------------------------------------
// APPROVE EVENT
// -------------------------------------------------
exports.approveEvent = catchAsync(async (req, res) => {
  const approved = await eventService.approveEvent(req.params.id);

  res.json({
    success: true,
    message: "Event approved",
    data: approved,
  });
});
