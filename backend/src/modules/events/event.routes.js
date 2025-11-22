// backend/src/modules/events/event.routes.js

const router = require("express").Router();
const controller = require("./event.controller");
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validateRequest");

const {
  createEventSchema,
  registerEventSchema,
  updateEventSchema,
  approveEventSchema,
  cancelEventSchema,
} = require("./event.validation");

// ---------------- CREATE EVENT (Alumni / Faculty / Admin) ----------------
router.post(
  "/",
  auth,
  role("alumni", "faculty", "admin"),
  validate(createEventSchema),
  controller.createEvent
);

// ---------------- PUBLIC EVENTS (NO AUTH) ----------------
router.get("/public", controller.getPublicEvents);

// ---------------- APPROVED EVENTS (AUTH REQUIRED) ----------------
router.get("/", auth, controller.getEvents);

// ---------------- EVENT DETAILS (AUTH REQUIRED) ----------------
router.get("/:id", auth, controller.getEventDetails);

// ---------------- REGISTER FOR EVENT (Student / Alumni / Faculty) ----------------
router.post(
  "/:id/register",
  auth,
  role("student", "alumni", "faculty"),
  validate(registerEventSchema),
  controller.registerEvent
);

// ---------------- CANCEL EVENT (Creator / Admin) ----------------
router.patch(
  "/:id/cancel",
  auth,
  role("alumni", "faculty", "admin"),
  validate(cancelEventSchema),
  controller.cancelEvent
);

// ---------------- UPDATE EVENT (Creator Only: Alumni / Faculty) ----------------
router.put(
  "/:id",
  auth,
  role("alumni", "faculty"),
  validate(updateEventSchema),
  controller.updateEvent
);

// ---------------- APPROVE EVENT (Admin Only) ----------------
router.patch(
  "/:id/approve",
  auth,
  role("admin"),
  validate(approveEventSchema),
  controller.approveEvent
);

module.exports = router;
