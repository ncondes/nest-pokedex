import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  MONGODB: Joi.string().required(),
  DEFAULT_LIMIT: Joi.number().default(10),
  PORT: Joi.number().default(3001),
});
