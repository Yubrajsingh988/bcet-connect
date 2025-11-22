const Joi = require("joi");

const objectId = Joi.string().length(24).hex().required();

// CREATE EVENT
exports.createEventSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().min(10).required(),
    date: Joi.string().required(),
    time: Joi.string().required(),
    location: Joi.string().required(),
    banner: Joi.string().uri().optional(),
    category: Joi.string().valid(
      "tech",
      "non-tech",
      "sports",
      "cultural",
      "community",
      "general"
    ),
  }),
};

// REGISTER EVENT
exports.registerEventSchema = {
  params: Joi.object({
    id: objectId,
  }),
};

// UPDATE EVENT
exports.updateEventSchema = {
  params: Joi.object({ id: objectId }),
  body: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    date: Joi.string(),
    time: Joi.string(),
    location: Joi.string(),
    banner: Joi.string(),
    category: Joi.string(),
  }).min(1),
};

// APPROVE EVENT
exports.approveEventSchema = {
  params: Joi.object({ id: objectId }),
};

// CANCEL EVENT
exports.cancelEventSchema = {
  params: Joi.object({ id: objectId }),
};
