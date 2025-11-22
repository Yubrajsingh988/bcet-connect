// frontend/src/services/searchService.js
// Purpose: call backend /search?q= with optional params and request cancellation support
//
// Usage examples:
//
// // Basic:
// searchService.globalSearch("machine learning").then(res => console.log(res));
//
// // With limit and AbortController (recommended for typeahead to cancel stale requests):
// const controller = new AbortController();
// searchService.globalSearch("ml", { limit: 6 }, { signal: controller.signal })
//   .then(data => console.log(data))
//   .catch(err => { if (err.name === 'CanceledError' || err.name === 'AbortError') { /* ignored */ }});
//
// // To cancel:
// controller.abort();

import api from "./apiClient";

/**
 * globalSearch - wrapper around GET /search
 * @param {string} q - search query
 * @param {Object} params - extra params (limit, offset, etc.)
 * @param {Object} options - { signal } optional AbortSignal to cancel request
 * @returns {Promise<Object>} resolves to response.data (the search result object)
 */
const globalSearch = async (q = "", params = {}, options = {}) => {
  // normalize args
  const safeQ = q == null ? "" : String(q);
  const safeParams = { q: safeQ, ...params };

  // axios supports AbortController via 'signal' option (modern browsers + node)
  const axiosOpts = {};
  if (options && options.signal) axiosOpts.signal = options.signal;

  const res = await api.get("/search", { params: safeParams, ...axiosOpts });
  // return the API payload directly to caller
  return res.data;
};

export default {
  globalSearch,
};
