export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3002,
  mongodb: process.env.MONGODB,
  default_limit: parseInt(process.env.DEFAULT_LIMIT, 10) || 10,
});
