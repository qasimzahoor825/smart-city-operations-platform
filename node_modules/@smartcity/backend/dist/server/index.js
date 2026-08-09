"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const loaders_1 = require("../loaders");
const socket_1 = require("../core/socket");
const config_1 = require("../config");
const logger_1 = require("../core/logger");
const mongo_1 = require("../core/database/mongo");
const repository_1 = require("../core/database/repository");
const bootstrap_1 = require("../core/seed/bootstrap");
const jobs_1 = require("../modules/sla/jobs");
async function bootstrap() {
    const app = await (0, loaders_1.createApp)();
    const server = (0, socket_1.createHttpServerWithSocket)(app);
    // Mongo connectivity first (in-memory repositories keep the demo alive if it fails).
    await (0, mongo_1.connectMongo)();
    await (0, bootstrap_1.bootstrapDatabase)();
    await (0, repository_1.attachAllRepositories)();
    // Background SLA monitoring (deadline breach, notifications, escalation).
    (0, jobs_1.startSlaMonitor)();
    server.listen(config_1.config.port, () => {
        logger_1.logger.info(`SmartCity OS Monolith listening on http://localhost:${config_1.config.port}`);
        console.log(`🏙️  SmartCity OS Monolith on port ${config_1.config.port}`);
    });
    const shutdown = () => {
        logger_1.logger.info("Shutting down gracefully…");
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
bootstrap().catch((err) => {
    logger_1.logger.error("Failed to bootstrap monolith", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map