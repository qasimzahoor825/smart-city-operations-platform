import "dotenv/config";
import { createApp } from "../loaders";
import { createHttpServerWithSocket } from "../core/socket";
import { config } from "../config";
import { logger } from "../core/logger";
import { connectMongo } from "../core/database/mongo";
import { attachAllRepositories } from "../core/database/repository";
import { bootstrapDatabase } from "../core/seed/bootstrap";
import { startSlaMonitor } from "../modules/sla/jobs";

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const server = createHttpServerWithSocket(app);

  // Mongo connectivity first (in-memory repositories keep the demo alive if it fails).
  await connectMongo();
  await bootstrapDatabase();
  await attachAllRepositories();

  // Background SLA monitoring (deadline breach, notifications, escalation).
  startSlaMonitor();

  server.listen(config.port, () => {
    logger.info(`SmartCity OS Monolith listening on http://localhost:${config.port}`);
    console.log(`🏙️  SmartCity OS Monolith on port ${config.port}`);
  });

  const shutdown = (): void => {
    logger.info("Shutting down gracefully…");
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((err) => {
  logger.error("Failed to bootstrap monolith", err);
  process.exit(1);
});