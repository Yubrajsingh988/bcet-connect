import * as analyticsService from "./analytics.service.js";
import catchAsync from "../../utils/catchAsync.js";

/**
 * 📌 OVERVIEW — Summary Stats for Dashboard
 * Includes total users, alumni/students split, pending approvals, etc.
 */
export const getOverview = catchAsync(async (req, res) => {
  const data = await analyticsService.getOverview();
  res.json({ success: true, data });
});

/**
 * 📌 USER ANALYTICS — Role data, active users, monthly signups
 */
export const userStats = catchAsync(async (req, res) => {
  const data = await analyticsService.userStats();
  res.json({ success: true, data });
});

/**
 * 📌 JOBS ANALYTICS — Approval count, category stats, posting trends
 */
export const jobStats = catchAsync(async (req, res) => {
  const data = await analyticsService.jobStats();
  res.json({ success: true, data });
});

/**
 * 📌 EVENTS ANALYTICS — Registrations, approval stats, engagement
 */
export const eventStats = catchAsync(async (req, res) => {
  const data = await analyticsService.eventStats();
  res.json({ success: true, data });
});

/**
 * 📌 COMMUNITY ANALYTICS — Members, activity, top channels
 */
export const communityStats = catchAsync(async (req, res) => {
  const data = await analyticsService.communityStats();
  res.json({ success: true, data });
});

/**
 * 📌 FEED / POSTS ANALYTICS — Trends, popular posts, activity
 */
export const feedStats = catchAsync(async (req, res) => {
  const data = await analyticsService.feedStats();
  res.json({ success: true, data });
});

/**
 * 📌 DONATIONS ANALYTICS — Total funds, monthly contributions
 */
export const donationStats = catchAsync(async (req, res) => {
  const data = await analyticsService.donationStats();
  res.json({ success: true, data });
});

/**
 * OPTIONAL: AI / LEARNING ANALYTICS (Future scope)
 */
export const learningStats = catchAsync(async (req, res) => {
  const data = await analyticsService.learningStats();
  res.json({ success: true, data });
});
