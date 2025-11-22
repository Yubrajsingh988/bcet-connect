// backend/src/modules/donations/donation.routes.js

const router = require("express").Router();

const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const validateRequest = require("../../middleware/validateRequest");

const donationController = require("./donation.controller");
const donationValidation = require("./donation.validation");

// POST /api/donations  (Alumni donate)
router.post(
  "/",
  auth,
  role("alumni"),
  validateRequest(donationValidation.createDonation),
  donationController.createDonation
);

// GET /api/donations/me  (My donations)
router.get("/me", auth, role("alumni"), donationController.getMyDonations);

// GET /api/donations  (Admin list)
router.get("/", auth, role("admin"), donationController.getAllDonations);

// POST /api/donations/verify  (Admin/webhook)
router.post(
  "/verify",
  auth, // later: replace with gateway signature verification for webhook
  role("admin"),
  validateRequest(donationValidation.verifyDonation),
  donationController.verifyDonation
);

// GET /api/donations/leaderboard  (public)
router.get("/leaderboard", donationController.getDonationLeaderboard);

// GET /api/donations/stats (Admin analytics)
router.get("/stats", auth, role("admin"), donationController.getDonationStats);

module.exports = router;
