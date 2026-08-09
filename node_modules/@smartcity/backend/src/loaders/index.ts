import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "../config";
import { errorHandler, notFoundHandler } from "../core/errors";
import { apiLimiter } from "../middleware/rate-limit";
import { mountRoutes } from "./routes";
import { mongoState, pingMongo } from "../core/database/mongo";
import { setupSwagger } from "../swagger";

export async function createApp(): Promise<Express> {
  const app: Express = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin === "*" ? true : [config.corsOrigin],
      credentials: true,
    }),
  );
  app.use(morgan(config.env === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

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
    const db = mongoState() === "connected" && (await pingMongo());
    res.json({
      service: "SmartCity OS Monolith",
      status: "UP",
      database: "mongodb",
      databaseStatus: db ? "connected" : "disconnected",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/v1", apiLimiter);

  mountRoutes(app);

  setupSwagger(app);

  app.use("/api/v1", notFoundHandler);
  app.use(errorHandler);

  return app;
}