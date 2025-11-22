const LearningResource = require("./learningResource.model");
const axios = require("axios");
const User = require("../user/user.model");

// 1) Get resources (optional filter by skill ?skill=React)
exports.getResources = async (skill) => {
  const filter = skill ? { skills: skill } : {};
  return LearningResource.find(filter).sort({ createdAt: -1 });
};

// 2) Create a new resource
exports.createResource = async (data, userId) => {
  data.createdBy = userId;
  return LearningResource.create(data);
};

// 3) Upvote resource
exports.upvoteResource = async (id, userId) => {
  return LearningResource.findByIdAndUpdate(
    id,
    {
      $addToSet: { upvotes: userId },  // duplicate avoid
      $pull: { downvotes: userId },    // agar pehle downvote kiya tha to hatao
    },
    { new: true }
  );
};

// 4) Downvote resource
exports.downvoteResource = async (id, userId) => {
  return LearningResource.findByIdAndUpdate(
    id,
    {
      $addToSet: { downvotes: userId },
      $pull: { upvotes: userId },
    },
    { new: true }
  );
};

// 5) AI resume parsing (safe dummy fallback ke sath)
exports.parseResumeWithAI = async (resumeText) => {
  const url = process.env.AI_RESUME_PARSER_URL;

  // Agar AI service set nahi hai -> dummy response do (taaki backend crash na ho)
  if (!url) {
    return {
      skills: ["JavaScript", "React", "Node.js"],
      summary: "Dummy AI summary (set AI_RESUME_PARSER_URL for real AI).",
      score: 75,
    };
  }

  const res = await axios.post(url, { text: resumeText });
  return res.data; // Expect: { skills, summary, score }
};

// 6) AI learning path generator (safe dummy fallback)
exports.generateLearningPath = async (userId, goalRole) => {
  const user = await User.findById(userId).select("skills");
  const url = process.env.AI_LEARNING_PATH_URL;

  if (!url) {
    return {
      recommendedSkills: ["Data Structures", "React", "Node.js"],
      timeline: "3 months (dummy)",
      steps: [
        "Complete basics of JavaScript",
        "Learn React fundamentals",
        "Build 2-3 full-stack projects with Node.js",
      ],
    };
  }

  const res = await axios.post(url, {
    currentSkills: user.skills,
    goalRole, // e.g. "Full Stack Developer"
  });

  return res.data; // Expect: { steps, recommendedSkills, timeline }
};
