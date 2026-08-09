import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { store } from "./data/store";
import authRoutes from "./routes/auth.routes";
import { AppError } from "@smartcity/common";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(","),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    service: "Auth Service",
    status: "UP",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/auth", authRoutes);
app.use("/api/v1/auth", authRoutes);
app.use(authRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// Central error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  console.error("[AuthService] Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

store
  .seed()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`🔐 Auth Service listening on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to seed auth service", err);
    process.exit(1);
  });

export default app;