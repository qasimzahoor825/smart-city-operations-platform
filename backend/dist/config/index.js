"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
exports.config = {
    env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 4100),
    apiPrefix: "/api/v1",
    jwt: {
        secret: process.env.JWT_SECRET || "smartcity_monolith_dev_secret",
        refreshSecret: process.env.REFRESH_SECRET || "smartcity_monolith_refresh_secret",
        accessTtl: process.env.ACCESS_TOKEN_TTL || "15m",
        refreshTtlDays: 14,
    },
    database: {
        // MONGODB_URI is the canonical connection string; MONGODB_URL kept for back-compat.
        mongoUrl: process.env.MONGODB_URI ||
            process.env.MONGODB_URL ||
            "mongodb://localhost:27017/enterprise-smart-city-platform",
    },
    corsOrigin: process.env.CORS_ORIGIN || "*",
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
    mail: {
        transport: process.env.EMAIL_TRANSPORT ||
            (process.env.SMTP_HOST ? "smtp" : "mock-console"),
        from: process.env.EMAIL_FROM || "SmartCity OS <no-reply@smartcity.gov>",
        smtp: {
            host: process.env.SMTP_HOST || "",
            port: Number(process.env.SMTP_PORT || 587),
            user: process.env.SMTP_USER || "",
            pass: process.env.SMTP_PASS || "",
            secure: process.env.SMTP_SECURE === "true",
        },
    },
    sms: {
        fast2sms: {
            apiKey: process.env.FAST2SMS_API_KEY || "",
            senderId: process.env.FAST2SMS_SENDER_ID || "",
        },
    },
    admin: {
        // Optional first-run super admin; created only if the env vars are set
        // (never hard-coded, never seeded as fake data).
        email: process.env.INITIAL_ADMIN_EMAIL || "",
        password: process.env.INITIAL_ADMIN_PASSWORD || "",
        name: process.env.INITIAL_ADMIN_NAME || "System Administrator",
    },
    ai: {
        geminiApiKey: process.env.GEMINI_API_KEY || "",
        // Keep the model configurable; falls back to heuristic classifiers when unavailable.
        geminiModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",
        // AI_PROVIDER: "gemini" (native API) or "openrouter" (unified gateway). Auto-selects openrouter when its key is set.
        provider: process.env.AI_PROVIDER || (process.env.OPENROUTER_API_KEY ? "openrouter" : "gemini"),
        openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
        aiModel: process.env.AI_MODEL || "google/gemini-3.7-flash",
        // Chat uses a fast model so the assistant feels responsive; override with AI_CHAT_MODEL.
        aiChatModel: process.env.AI_CHAT_MODEL || process.env.AI_MODEL || "google/gemini-3.7-flash",
    },
};
//# sourceMappingURL=index.js.map