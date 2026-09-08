"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
exports.config = {
    env: process.env.NODE_ENV || "development",
    /** Explicit demo flag — mirrors dev conveniences (on-screen OTP, demo verify)
     *  when deploying with NODE_ENV=production on Render. */
    demoMode: process.env.DEMO_MODE === "true",
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
    emailValidation: {
        // Abstract API Email Validation — signup-time delivery check.
        // When no key is set the check is skipped so the flow never blocks offline.
        provider: process.env.EMAIL_VALIDATION_PROVIDER || "abstract",
        abstractApiKey: process.env.ABSTRACT_API_KEY || "",
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
        // AI_PROVIDER: "heuristic" (fast, offline, deterministic), "gemini" (native API)
        // or "openrouter" (unified gateway). Defaults to heuristic when no key is set so
        // the platform always works without network access.
        provider: process.env.AI_PROVIDER ||
            (process.env.OPENROUTER_API_KEY ? "openrouter" : process.env.GEMINI_API_KEY || "heuristic"),
        openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
        aiModel: process.env.AI_MODEL || "google/gemini-3.7-flash",
        // Chat uses a fast model so the assistant feels responsive; override with AI_CHAT_MODEL.
        aiChatModel: process.env.AI_CHAT_MODEL || process.env.AI_MODEL || "google/gemini-3.7-flash",
    },
};
//# sourceMappingURL=index.js.map