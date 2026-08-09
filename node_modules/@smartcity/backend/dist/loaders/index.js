"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("../config");
const errors_1 = require("../core/errors");
const rate_limit_1 = require("../middleware/rate-limit");
const routes_1 = require("./routes");
const mongo_1 = require("../core/database/mongo");
const swagger_1 = require("../swagger");
async function createApp() {
    const app = (0, express_1.default)();
    app.set("trust proxy", 1);
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: config_1.config.corsOrigin === "*" ? true : [config_1.config.corsOrigin],
        credentials: true,
    }));
    app.use((0, morgan_1.default)(config_1.config.env === "production" ? "combined" : "dev"));
    app.use(express_1.default.json({ limit: "2mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.get("/", (_req, res) => {
        res.json({
            service: "SmartCity OS Monolith",
            version: "1.0.0",
            docs: "/api-docs",
            health: "/health",
            database: "mongodb",
            status: "UP",
        });
    });
    app.get("/health", async (_req, res) => {
        const db = (0, mongo_1.mongoState)() === "connected" && (await (0, mongo_1.pingMongo)());
        res.json({
            service: "SmartCity OS Monolith",
            status: "UP",
            database: "mongodb",
            databaseStatus: db ? "connected" : "disconnected",
            uptimeSeconds: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
        });
    });
    app.use("/api/v1", rate_limit_1.apiLimiter);
    (0, routes_1.mountRoutes)(app);
    (0, swagger_1.setupSwagger)(app);
    app.use("/api/v1", errors_1.notFoundHandler);
    app.use(errors_1.errorHandler);
    return app;
}
//# sourceMappingURL=index.js.map