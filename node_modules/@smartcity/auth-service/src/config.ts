export const config = {
  port: Number(process.env.PORT || 4001),
  jwtSecret: process.env.JWT_SECRET || "smartcity_dev_jwt_secret_change_me",
  refreshSecret: process.env.REFRESH_SECRET || "smartcity_dev_refresh_secret_change_me",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  verificationTokenTtl: Number(process.env.VERIFY_TOKEN_TTL_MIN || 60),
  nodeEnv: process.env.NODE_ENV || "development",
  maxSessionsPerUser: Number(process.env.MAX_SESSIONS_PER_USER || 8),
  corsOrigin: process.env.CORS_ORIGIN || "*",
} as const;