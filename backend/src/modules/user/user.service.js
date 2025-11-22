// backend/src/modules/user/user.service.js
const mongoose = require("mongoose");
const User = require("./user.model");
const ApiError = require("../../utils/ApiError");
const { isValidObjectId } = mongoose;
const normalizeArray = (arr = []) =>
  Array.isArray(arr)
    ? [...new Set(arr.map(v => (typeof v === "string" ? v.trim() : v)).filter(Boolean))]
    : [];
const normalizeEducation = (items = []) =>
  Array.isArray(items)
    ? items.map(e => ({
        institute: e.institute?.trim(),
        degree: e.degree?.trim(),
        field: e.field?.trim(),
        startYear: e.startYear,
        endYear: e.endYear,
      })).filter(e => e.institute || e.degree)
    : [];
const normalizeExperience = (items = []) =>
  Array.isArray(items)
    ? items.map(e => ({
        company: e.company?.trim(),
        role: e.role?.trim(),
        startDate: e.startDate,
        endDate: e.endDate,
        description: e.description?.trim(),
      })).filter(e => e.company || e.role)
    : [];
const normalizeSocial = (social = {}) => {
  if (!social || typeof social !== "object") return {};
  const out = {};
  ["linkedin", "github", "twitter", "website"].forEach(k => {
    if (social[k]) out[k] = String(social[k]).trim();
  });
  return out;
};
const buildUpdateData = (payload = {}, allowedFields = [], files = {}) => {
  const data = {};
  for (const key of allowedFields) {
    if (payload[key] !== undefined) data[key] = payload[key];
  }
  if (files.avatar) {
    const url = Array.isArray(files.avatar)
      ? files.avatar[0]?.path
      : files.avatar?.path || files.avatar;
    if (url) data.avatar = url;
  }
  if (files.resume) {
    const url = Array.isArray(files.resume)
      ? files.resume[0]?.path
      : files.resume?.path || files.resume;
    if (url) data.resume = url;
  }
  if (data.skills) data.skills = normalizeArray(data.skills);
  if (data.education) data.education = normalizeEducation(data.education);
  if (data.experience) data.experience = normalizeExperience(data.experience);
  if (data.social) data.social = normalizeSocial(data.social);
  if (Array.isArray(data.portfolio)) {
    data.portfolio = data.portfolio.map(p => ({
      title: p.title?.trim(),
      link: p.link?.trim(),
      image: p.image?.trim(),
      description: p.description?.trim(),
      techStack: normalizeArray(p.techStack),
    })).filter(p => p.title);
  }
  return data;
};
exports.getProfileById = async (userId) => {
  if (!isValidObjectId(userId)) return null;
  const user = await User.findById(userId)
    .select("-password -refreshToken -__v")
    .lean({ virtuals: true });
  if (!user) return null;
  return {
    ...user,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
  };
};
exports.updateProfile = async (userId, payload = {}, files = {}) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }
  const allowedFields = [
    "name",
    "bio",
    "headline",
    "skills",
    "education",
    "experience",
    "portfolio",
    "social",
    "batch",
    "department",
    "avatar",
    "resume",
  ];
  const updateData = buildUpdateData(payload, allowedFields, files);
  if (!Object.keys(updateData).length) {
    throw new ApiError(400, "No valid fields provided to update");
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .select("-password -refreshToken -__v")
    .lean({ virtuals: true });
  if (!user) throw new ApiError(404, "User not found");
  return {
    ...user,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
  };
};
exports.getPublicProfile = async (userId) => {
  if (!isValidObjectId(userId)) return null;
  const user = await User.findById(userId)
    .select(User.publicProfileProjection())
    .lean({ virtuals: true });
  if (!user) return null;
  return {
    ...user,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
  };
};
exports.followUser = async (meId, targetId) => {
  if (!isValidObjectId(meId) || !isValidObjectId(targetId)) {
    throw new ApiError(400, "Invalid user id");
  }
  if (meId === targetId) {
    throw new ApiError(400, "You cannot follow yourself");
  }
  const updated = await User.updateOne(
    { _id: meId, following: { $ne: targetId } },
    { $addToSet: { following: targetId } }
  );
  if (!updated.modifiedCount) {
    return { success: true, message: "Already following" };
  }
  await User.updateOne(
    { _id: targetId },
    { $addToSet: { followers: meId } }
  );
  return { success: true, message: "Followed successfully" };
};
exports.unfollowUser = async (meId, targetId) => {
  if (!isValidObjectId(meId) || !isValidObjectId(targetId)) {
    throw new ApiError(400, "Invalid user id");
  }
  if (meId === targetId) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }
  await Promise.all([
    User.updateOne({ _id: meId }, { $pull: { following: targetId } }),
    User.updateOne({ _id: targetId }, { $pull: { followers: meId } }),
  ]);
  return { success: true, message: "Unfollowed successfully" };
};
exports.searchUsers = async (q = "", page = 1, limit = 20) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (safePage - 1) * safeLimit;
  const filter =
    q && q.trim().length
      ? { $text: { $search: q.trim() } }
      : {};
  const [items, total] = await Promise.all([
    User.find(filter)
      .select("name avatar headline skills department batch")
      .skip(skip)
      .limit(safeLimit)
      .lean({ virtuals: true }),
    User.countDocuments(filter),
  ]);
  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    pages: Math.ceil(total / safeLimit) || 1,
  };
};
