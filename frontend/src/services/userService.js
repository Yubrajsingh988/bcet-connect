// frontend/src/modules/profile/services/userService.js

import api from "@/services/apiClient";

/* ──────────────────────────────────────────────
   INTERNAL HELPERS
─────────────────────────────────────────────── */

/**
 * Normalize skills
 */
const normalizeSkills = (skills = []) => {
  if (!Array.isArray(skills)) return [];
  return [
    ...new Set(
      skills
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
    ),
  ];
};

/**
 * Normalize portfolio (BACKEND ALIGNED)
 */
const normalizePortfolio = (items = []) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((p) => ({
      title: p.title?.trim(),
      description: p.description?.trim() || "",
      link: p.link?.trim() || "",
      image: p.image || "",
      techStack: Array.isArray(p.techStack)
        ? p.techStack.map((t) => t.trim()).filter(Boolean)
        : [],
    }))
    .filter((p) => p.title);
};

/**
 * Ensure profileCompleteness always exists
 */
const ensureCompleteness = (profile) => {
  if (!profile) return profile;

  // If backend sent it, trust backend
  if (typeof profile.profileCompleteness === "number") {
    return profile;
  }

  // Fallback (frontend safety net)
  let score = 0;
  if (profile.avatar) score += 10;
  if (profile.bio) score += 10;
  if (profile.headline) score += 10;
  if (profile.skills?.length) score += 15;
  if (profile.education?.length) score += 10;
  if (profile.experience?.length) score += 15;
  if (profile.portfolio?.length) score += 10;
  if (profile.resume) score += 10;
  if (profile.social && Object.values(profile.social).some(Boolean)) score += 10;

  return {
    ...profile,
    profileCompleteness: Math.min(score, 100),
  };
};

/* ──────────────────────────────────────────────
   PROFILE QUERIES
─────────────────────────────────────────────── */

export const getMyProfile = async () => {
  const res = await api.get("/users/me");
  if (!res?.data?.data) {
    throw new Error("Profile payload missing");
  }
  return ensureCompleteness(res.data.data);
};

export const getPublicProfile = async (userId) => {
  if (!userId) throw new Error("User ID required");
  const res = await api.get(`/users/${userId}`);
  if (!res?.data?.data) {
    throw new Error("Public profile not found");
  }
  return ensureCompleteness(res.data.data);
};

/* ──────────────────────────────────────────────
   PROFILE UPDATE
─────────────────────────────────────────────── */

export const updateProfile = async (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid update payload");
  }

  const res = await api.put("/users/me", payload);
  return ensureCompleteness(res.data?.data);
};

/* ──────────────────────────────────────────────
   SKILLS
─────────────────────────────────────────────── */

export const updateSkills = async (skills = []) => {
  const normalized = normalizeSkills(skills);
  const res = await api.put("/users/me", { skills: normalized });
  return ensureCompleteness(res.data?.data);
};

export const addSkill = async (currentSkills = [], skill) => {
  if (!skill) return ensureCompleteness({ skills: currentSkills });
  const nextSkills = normalizeSkills([...currentSkills, skill]);
  return updateSkills(nextSkills);
};

export const removeSkill = async (currentSkills = [], skill) => {
  const nextSkills = normalizeSkills(
    currentSkills.filter((s) => s !== skill)
  );
  return updateSkills(nextSkills);
};

/* ──────────────────────────────────────────────
   PORTFOLIO
─────────────────────────────────────────────── */

export const updatePortfolio = async (portfolio = []) => {
  const normalized = normalizePortfolio(portfolio);
  const res = await api.put("/users/me", { portfolio: normalized });
  return ensureCompleteness(res.data?.data);
};

export const addPortfolioProject = async (currentPortfolio = [], project) => {
  return updatePortfolio([...currentPortfolio, project]);
};

export const updatePortfolioProject = async (
  currentPortfolio = [],
  projectId,
  patch
) => {
  const next = currentPortfolio.map((p) =>
    p._id === projectId ? { ...p, ...patch } : p
  );
  return updatePortfolio(next);
};

export const deletePortfolioProject = async (
  currentPortfolio = [],
  projectId
) => {
  const next = currentPortfolio.filter((p) => p._id !== projectId);
  return updatePortfolio(next);
};

/* ──────────────────────────────────────────────
   FILE UPLOADS
─────────────────────────────────────────────── */

export const uploadAvatar = async (file) => {
  if (!file) throw new Error("Avatar file required");
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.put("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return ensureCompleteness(res.data?.data);
};

export const uploadResume = async (file) => {
  if (!file) throw new Error("Resume file required");
  const formData = new FormData();
  formData.append("resume", file);

  const res = await api.put("/users/me/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return ensureCompleteness(res.data?.data);
};
