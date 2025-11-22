const learningService = require("./learning.service");

// ========== RESOURCES ==========

// GET /api/learning/resources?skill=React
exports.getResources = async (req, res, next) => {
  try {
    const { skill } = req.query;
    const resources = await learningService.getResources(skill);
    res.json({ success: true, data: resources });
  } catch (err) {
    next(err);
  }
};

// POST /api/learning/resources
exports.createResource = async (req, res, next) => {
  try {
    const resource = await learningService.createResource(req.body, req.user.id);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

// POST /api/learning/resources/:id/upvote
exports.upvoteResource = async (req, res, next) => {
  try {
    const updated = await learningService.upvoteResource(
      req.params.id,
      req.user.id
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// POST /api/learning/resources/:id/downvote
exports.downvoteResource = async (req, res, next) => {
  try {
    const updated = await learningService.downvoteResource(
      req.params.id,
      req.user.id
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ========== AI ENDPOINTS ==========

// POST /api/learning/parse-resume
// { resumeText: "..." }
exports.parseResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    const aiResult = await learningService.parseResumeWithAI(resumeText);
    res.json({ success: true, data: aiResult });
  } catch (err) {
    next(err);
  }
};

// POST /api/learning/learning-path
// { goalRole: "Full Stack Developer" }
exports.getLearningPath = async (req, res, next) => {
  try {
    const { goalRole } = req.body;
    const path = await learningService.generateLearningPath(
      req.user.id,
      goalRole
    );
    res.json({ success: true, data: path });
  } catch (err) {
    next(err);
  }
};
