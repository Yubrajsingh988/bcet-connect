// backend/src/modules/user/user.model.js
const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const portfolioItemSchema = new Schema({
  title: { type: String, required: true, trim: true },
  link: { type: String, trim: true },
  image: { type: String, trim: true },
  description: { type: String, trim: true },
  techStack: [{ type: String, trim: true }],
}, { _id: false });
const educationSchema = new Schema({
  institute: { type: String, trim: true },
  degree: { type: String, trim: true },
  field: { type: String, trim: true },
  startYear: { type: Number },
  endYear: { type: Number },
}, { _id: false });
const experienceSchema = new Schema({
  company: { type: String, trim: true },
  role: { type: String, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, trim: true },
}, { _id: false });
const socialSchema = new Schema({
  linkedin: { type: String, trim: true },
  github: { type: String, trim: true },
  twitter: { type: String, trim: true },
  website: { type: String, trim: true },
}, { _id: false });
const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "alumni", "faculty", "admin"], default: "student", index: true },
  bio: { type: String, default: "", trim: true },
  avatar: { type: String, trim: true },
  headline: { type: String, trim: true },
  batch: { type: String, trim: true, index: true },
  department: { type: String, trim: true, index: true },
  skills: { type: [String], default: [], index: true },
  education: { type: [educationSchema], default: [] },
  experience: { type: [experienceSchema], default: [] },
  portfolio: { type: [portfolioItemSchema], default: [] },
  social: { type: socialSchema, default: {} },
  resume: { type: String, trim: true },
  followers: [{ type: Types.ObjectId, ref: "User" }],
  following: [{ type: Types.ObjectId, ref: "User" }],
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});
userSchema.index({
  name: "text",
  headline: "text",
  skills: "text",
}, {
  name: "user_text_search_index",
  weights: { name: 5, headline: 3, skills: 2 },
});
userSchema.pre("save", function (next) {
  if (this.email) this.email = this.email.toLowerCase().trim();
  if (Array.isArray(this.skills)) {
    this.skills = [...new Set(this.skills.map((s) => s?.trim()).filter(Boolean))];
  }
  if (this.social) {
    Object.keys(this.social).forEach((k) => {
      if (this.social[k]) this.social[k] = this.social[k].trim();
    });
  }
  next();
});
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate()?.$set;
  if (!update) return next();
  if (update.email) update.email = update.email.toLowerCase().trim();
  if (Array.isArray(update.skills)) {
    update.skills = [...new Set(update.skills.map((s) => s?.trim()).filter(Boolean))];
  }
  if (update.social) {
    const cleaned = {};
    ["linkedin", "github", "twitter", "website"].forEach((k) => {
      if (update.social[k]) cleaned[k] = update.social[k].trim();
    });
    update.social = cleaned;
  }
  next();
});
userSchema.virtual("profileCompleteness").get(function () {
  let score = 0;
  if (this.avatar) score += 10;
  if (this.bio) score += 10;
  if (this.headline) score += 10;
  if (this.skills?.length) score += 15;
  if (this.education?.length) score += 10;
  if (this.experience?.length) score += 15;
  if (this.portfolio?.length) score += 10;
  if (this.resume) score += 10;
  if (this.social && Object.values(this.social).some(Boolean)) score += 10;
  return Math.min(score, 100);
});
function removeSensitive(_, ret) {
  delete ret.password;
  delete ret.__v;
  delete ret.refreshToken;
  return ret;
}
userSchema.set("toJSON", { virtuals: true, transform: removeSensitive });
userSchema.set("toObject", { virtuals: true, transform: removeSensitive });
userSchema.statics.publicProfileProjection = function () {
  return "name avatar headline bio skills portfolio social batch department role createdAt profileCompleteness";
};
userSchema.methods.safeObject = function () {
  return this.toObject({ virtuals: true });
};
module.exports = model("User", userSchema);