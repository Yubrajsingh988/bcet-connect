// frontend/src/services/notificationService.js
// Upgraded notification API wrapper
// - returns res.data (so callers get payload directly)
// - supports AbortController via options.signal
// - consistent param handling and small helpers for pagination

import api from "./apiClient"; // your axios instance

// Helper to unwrap axios and return data or throw normalized error
async function unwrap(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    // normalize axios error shape, preserve original for debugging
    if (err.response) {
      const { status, data } = err.response;
      const message = (data && (data.message || data.error)) || data || err.message;
      const e = new Error(message);
      e.status = status;
      e.response = data;
      throw e;
    }
    throw err;
  }
}

/**
 * fetchNotifications
 * @param {Object} opts - { page=1, limit=20, skip, signal }
 *   - supports page/limit or skip/limit depending on your backend
 * @returns {Promise<Object>} - API payload (expected: { success: true, data: { total, items } })
 */
export const fetchNotifications = (opts = {}) => {
  const {
    page = 1,
    limit = 20,
    skip = undefined,
    signal = undefined,
    extraParams = {}
  } = opts;

  // prefer page/limit if provided; otherwise allow skip & limit
  const params = { page, limit, ...extraParams };
  if (typeof skip !== "undefined") {
    // some APIs use skip instead of page
    delete params.page;
    params.skip = skip;
  }

  return unwrap(api.get("/notifications", { params, signal }));
};

/**
 * fetchUnreadCount
 * returns: { success: true, data: { unreadCount: number } }
 */
export const fetchUnreadCount = ({ signal } = {}) =>
  unwrap(api.get("/notifications/unread-count", { signal }));

/**
 * markNotificationRead
 * @param {string} id
 * returns updated notification object in res.data
 */
export const markNotificationRead = (id) =>
  unwrap(api.post(`/notifications/${id}/mark-read`));

/**
 * markAllRead
 * returns success message
 */
export const markAllRead = () =>
  unwrap(api.post("/notifications/mark-all-read"));

/**
 * deleteNotification
 * @param {string} id
 */
export const deleteNotification = (id) =>
  unwrap(api.delete(`/notifications/${id}`));

/**
 * createNotification (optional helper, used if frontend triggers server-side notification creation)
 * - Usually notifications are created server-side; include helper for admin/test use.
 * @param {Object} payload - { userId, actorId, title, message, type, data }
 */
export const createNotification = (payload) =>
  unwrap(api.post("/notifications", payload));

export default {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  createNotification,
};
