// backend/src/modules/events/event.routes.js
const express = require("express");
const router = express.Router();

const controller = require("./event.controller");
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validateRequest");
const uploadMW = require("../../middleware/uploadMiddleware");

const {
  createEventSchema,
  registerEventSchema,
  updateEventSchema,
  approveEventSchema,
  cancelEventSchema,
} = require("./event.validation");

/**
 * NOTE about multipart/form-data & validation:
 * - For routes that accept file uploads (banner), mount upload middleware BEFORE validation
 *   so Joi can validate the text fields present in req.body (multer puts form fields into req.body).
 */

/**
 * CREATE EVENT
 * POST  /events
 * Access: alumni, faculty, admin
 * Accepts multipart/form-data (banner optional)
 */
router.post(
  "/",
  auth,
  role("alumni", "faculty", "admin"),
  uploadMW.single("banner", "events"), // optional banner upload
  validate(createEventSchema),
  controller.createEvent
);

/**
 * PUBLIC EVENTS (no auth) — approved + upcoming
 * GET /events/public
 */
router.get("/public", controller.getPublicEvents);

/**
 * GET EVENTS (approved) - auth protected listing (could be same as public)
 * GET /events
 */
router.get("/", auth, controller.getEvents);

/**
 * EVENT DETAILS
 * GET /events/:id
 */
router.get("/:id", auth, controller.getEventDetails);

/**
 * REGISTER FOR EVENT
 * POST /events/:id/register
 * Access: student, alumni, faculty
 */
router.post(
  "/:id/register",
  auth,
  role("student", "alumni", "faculty"),
  validate(registerEventSchema),
  controller.registerEvent
);

/**
 * CANCEL EVENT (creator or admin)
 * PATCH /events/:id/cancel
 */
router.patch(
  "/:id/cancel",
  auth,
  role("alumni", "faculty", "admin"),
  validate(cancelEventSchema),
  controller.cancelEvent
);

/**
 * UPDATE EVENT
 * PUT /events/:id
 * Access: alumni, faculty (creator)
 * Allow banner re-upload
 */
router.put(
  "/:id",
  auth,
  role("alumni", "faculty"),
  uploadMW.single("banner", "events"), // optional banner update
  validate(updateEventSchema),
  controller.updateEvent
);

/**
 * APPROVE EVENT (admin only)
 * PATCH /events/:id/approve
 */
router.patch(
  "/:id/approve",
  auth,
  role("admin"),
  validate(approveEventSchema),
  controller.approveEvent
);

module.exports = router;
