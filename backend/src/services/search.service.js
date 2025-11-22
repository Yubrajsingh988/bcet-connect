// backend/src/services/search.service.js
/**
 * Global search service
 *
 * Searches across users, jobs, events and communities.
 * Strategy:
 *  1. If possible, use MongoDB text search ($text) for ranked results (requires text indexes).
 *  2. Otherwise use a safe, escaped case-insensitive regex on a small set of fields.
 *
 * Returns:
 * {
 *   users: { items: [...], total: Number },
 *   jobs: { items: [...], total: Number },
 *   events: { items: [...], total: Number },
 *   communities: { items: [...], total: Number }
 * }
 *
 * Notes:
 * - Make sure you created text indexes for better performance (e.g. User: name, headline, skills).
 * - This is an MVP-friendly approach. For large scale or complex queries switch to Elasticsearch/Atlas Search.
 */

const mongoose = require("mongoose");
const User = require("../modules/user/user.model");
const Job = require("../modules/jobs/job.model");
const Event = require("../modules/events/event.model");
const Community = require("../modules/communities/community.model");

// safety caps
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 6;

/**
 * Escape string for use in RegExp (prevents regex DoS / injection).
 */
function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

/**
 * Helper to determine if a collection supports $text search.
 * We try to run an explain() call to check for text index availability; if explain fails or is slow,
 * fallback to regex. For safety and simplicity, we do a lightweight check using listIndexes once per
 * model and cache it.
 */
const textIndexCache = new Map();
async function hasTextIndex(model) {
  const modelName = model.modelName;
  if (textIndexCache.has(modelName)) return textIndexCache.get(modelName);

  try {
    const indexes = await model.collection.indexes();
    const found = indexes.some((ix) => {
      // index key object with "$**" shouldn't be considered text; we're looking for any index where value is "text"
      return Object.values(ix.key || {}).some((v) => v === "text");
    });
    textIndexCache.set(modelName, !!found);
    return !!found;
  } catch (err) {
    // in case of error, assume no text index (safer)
    textIndexCache.set(modelName, false);
    return false;
  }
}

/**
 * Build a regex-based filter for a model with an array of fields.
 */
function buildRegexFilter(q, fields) {
  const safe = escapeForRegex(q);
  const regex = new RegExp(safe, "i");
  return {
    $or: fields.map((f) => ({ [f]: regex }))
  };
}

/**
 * Search wrapper for a single collection that tries $text first (if available),
 * then falls back to regex.
 */
async function searchCollection(model, {
  q,
  fields = [],                 // fields for regex fallback
  textProjection = null,       // projection to use with $text
  select = "",                 // mongoose select string
  limit = DEFAULT_LIMIT,
  skip = 0
} = {}) {
  if (!q || !q.trim()) {
    return { items: [], total: 0 };
  }

  limit = Math.max(1, Math.min(limit, MAX_LIMIT));
  skip = Math.max(0, parseInt(skip, 10) || 0);

  // Try text-indexed search when available
  try {
    const supportsText = await hasTextIndex(model);
    if (supportsText) {
      // Use $text for ranking. projection includes score when available.
      const projection = Object.assign({}, textProjection || {});
      // include text score
      projection.score = { $meta: "textScore" };

      const query = { $text: { $search: q } };

      // total count
      const total = await model.countDocuments(query);
      // fetch items ordered by text score
      const items = await model.find(query, projection)
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(select)
        .lean();

      return { items, total };
    }
  } catch (err) {
    // If anything goes wrong with text search, fallback to regex below.
    // Do not throw here — we want graceful fallback and to keep service available.
    console.warn(`[search.service] text search failed for model ${model.modelName}:`, err.message || err);
  }

  // Regex fallback (safe escaped regex)
  if (!Array.isArray(fields) || fields.length === 0) {
    // nothing to search
    return { items: [], total: 0 };
  }

  const filter = buildRegexFilter(q, fields);

  const total = await model.countDocuments(filter);
  const items = await model.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(select)
    .lean();

  return { items, total };
}

/**
 * Public API: globalSearch
 * options:
 *  - limit (per-collection)
 *  - skip
 *  - page (1-based) OR skip allowed
 *  - collections: array of names to include: ['users','jobs','events','communities']
 */
async function globalSearch(q, options = {}) {
  const { limit = DEFAULT_LIMIT, page = 1, skip = null, collections = null } = options;
  const resolvedSkip = (skip != null) ? Math.max(0, skip) : Math.max(0, (parseInt(page, 10) - 1) * limit);

  const limitPer = Math.max(1, Math.min(limit, MAX_LIMIT));

  // Normalize collections filter
  const allowedCollections = new Set(["users", "jobs", "events", "communities"]);
  const include = (Array.isArray(collections) && collections.length > 0)
    ? new Set(collections.filter(c => allowedCollections.has(String(c))))
    : allowedCollections;

  // Prepare parallel tasks
  const tasks = [];

  if (include.has("users")) {
    tasks.push(
      searchCollection(User, {
        q,
        fields: ["name", "headline", "skills", "department"], // small set of searchable fields
        textProjection: { name: 1, headline: 1, avatar: 1, department: 1 },
        select: "_id name headline avatar batch department role", // safe public fields
        limit: limitPer,
        skip: resolvedSkip
      }).then(res => ({ key: "users", res }))
    );
  } else {
    tasks.push(Promise.resolve({ key: "users", res: { items: [], total: 0 } }));
  }

  if (include.has("jobs")) {
    tasks.push(
      searchCollection(Job, {
        q,
        fields: ["title", "company", "skills", "location"],
        textProjection: { title: 1, company: 1, location: 1 },
        select: "_id title company location minSalary maxSalary tags postedBy",
        limit: limitPer,
        skip: resolvedSkip
      }).then(res => ({ key: "jobs", res }))
    );
  } else {
    tasks.push(Promise.resolve({ key: "jobs", res: { items: [], total: 0 } }));
  }

  if (include.has("events")) {
    tasks.push(
      searchCollection(Event, {
        q,
        fields: ["title", "description", "location"],
        textProjection: { title: 1, date: 1, location: 1 },
        select: "_id title date location organiser",
        limit: limitPer,
        skip: resolvedSkip
      }).then(res => ({ key: "events", res }))
    );
  } else {
    tasks.push(Promise.resolve({ key: "events", res: { items: [], total: 0 } }));
  }

  if (include.has("communities")) {
    tasks.push(
      searchCollection(Community, {
        q,
        fields: ["name", "description", "tags"],
        textProjection: { name: 1, membersCount: 1 },
        select: "_id name description membersCount",
        limit: limitPer,
        skip: resolvedSkip
      }).then(res => ({ key: "communities", res }))
    );
  } else {
    tasks.push(Promise.resolve({ key: "communities", res: { items: [], total: 0 } }));
  }

  // Execute all tasks in parallel
  const results = await Promise.all(tasks);

  // Reduce to an object
  const out = results.reduce((acc, { key, res }) => {
    acc[key] = res;
    return acc;
  }, { users: { items: [], total: 0 }, jobs: { items: [], total: 0 }, events: { items: [], total: 0 }, communities: { items: [], total: 0 } });

  return out;
}

module.exports = {
  globalSearch,
  // Expose helpers for tests or advanced use
  _internal: {
    escapeForRegex,
    buildRegexFilter,
    hasTextIndex
  }
};
