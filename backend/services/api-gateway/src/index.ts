import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import http from "node:http";
import https from "node:https";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "smartcity_dev_jwt_secret_change_me";

const SVC = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  complaints: process.env.COMPLAINT_SERVICE_URL || "http://localhost:4002",
  payments: process.env.PAYMENT_SERVICE_URL || "http://localhost:4003",
  gis: process.env.GIS_SERVICE_URL || "http://localhost:4004",
  iot: process.env.IOT_SERVICE_URL || "http://localhost:4005",
  notifications: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4006",
  departments: process.env.DEPARTMENT_SERVICE_URL || "http://localhost:4007",
};

// ---------- Global middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN === "*" ? true : process.env.CORS_ORIGIN?.split(",") || true,
    credentials: true,
  }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ---------- Rate limiting ----------
const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please slow down." },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Try again later." },
});
app.use("/api/v1/auth", authLimiter);
app.use(globalLimiter);

// ---------- Reverse proxy (streams raw request body) ----------
const HOP_HEADERS = [
  "connection",
  "transfer-encoding",
  "upgrade",
  "keep-alive",
  "proxy-authorization",
  "proxy-connection",
  "te",
];

function forward(target: string) {
  return (req: Request, res: Response): void => {
    const base = new URL(target);
    const headers: Record<string, string | string[] | undefined> = { ...req.headers, host: base.host };
    for (const h of HOP_HEADERS) delete headers[h];

    const transporter = base.protocol === "https:" ? https : http;
    const proxyReq = transporter.request({
      method: req.method,
      hostname: base.hostname,
      port: base.port || (base.protocol === "https:" ? "443" : "80"),
      path: req.url || "/",
      headers,
    });

    proxyReq.on("response", (proxyRes) => {
      const status = proxyRes.statusCode ?? 502;
      const outHeaders: Record<string, string | string[] | undefined> = { ...proxyRes.headers };
      delete outHeaders["connection"];
      res.writeHead(status, outHeaders);
      proxyRes.pipe(res);
    });
    proxyReq.on("error", (err) => {
      if (!res.headersSent) {
        res.status(502).json({ success: false, message: `Upstream unavailable: ${err.message}` });
      } else {
        res.end();
      }
    });
    req.pipe(proxyReq);
  };
}

// ---------- Service routing ----------
// Every downstream service exposes routes at its own base path (e.g. /complaints),
// which is exactly what the frontend calls after the /api/v1 prefix. The gateway
// forwards the sub-path to whichever service owns that resource.
const SEG_TO_SVC: Record<string, string> = {
  auth: SVC.auth,
  complaints: SVC.complaints,
  departments: SVC.departments,
  users: SVC.departments,
  assets: SVC.departments,
  emergencies: SVC.departments,
  appointments: SVC.departments,
  reports: SVC.departments,
  bills: SVC.payments,
  transactions: SVC.payments,
  pay: SVC.payments,
  payments: SVC.payments,
  layers: SVC.gis,
  markers: SVC.gis,
  search: SVC.gis,
  readings: SVC.iot,
  sensors: SVC.iot,
  ingest: SVC.iot,
  notifications: SVC.notifications,
};

// ---------- Health ----------
app.get("/health", (_req, res) => {
  res.json({
    service: "SmartCity API Gateway",
    status: "UP",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ---------- OpenAPI / docs ----------
app.get("/api-docs", (_req, res) => {
  res.redirect("/swagger.json");
});

// Health status per service (edge that surfaces downstream liveness)
app.get("/api/v1/services", (_req, res) => {
  res.json({
    success: true,
    data: Object.entries(SVC).map(([name, url]) => ({
      name,
      url,
      status: "UP", // would pulse each service; localhost proxies report via their own /health
    })),
  });
});

// ---------- Platform settings (admin-only, in-memory) ----------
let systemSettings: Record<string, boolean> = {
  rateLimiting: true,
  maintenanceMode: false,
  emailNotifications: true,
  smsAlerts: true,
};

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    if (payload.role !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, message: "Insufficient permissions" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

app.get("/api/v1/settings", requireAdmin, (_req, res) => {
  res.json({ success: true, data: systemSettings, timestamp: new Date().toISOString() });
});

app.put("/api/v1/settings", requireAdmin, express.json({ limit: "64kb" }), (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  Object.keys(systemSettings).forEach((key) => {
    if (typeof body[key] === "boolean") systemSettings[key] = body[key];
  });
  res.json({ success: true, data: systemSettings, timestamp: new Date().toISOString() });
});

app.use("/api/v1", (req, res) => {
  const seg = (req.url.split("?")[0].split("/")[1] || "").toLowerCase();
  const target = SEG_TO_SVC[seg];
  if (!target) {
    res.status(404).json({ success: false, message: "Route not found" });
    return;
  }
  if (seg !== "auth") {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      res.status(401).json({ success: false, message: "Invalid or expired token" });
      return;
    }
  }
  forward(target)(req, res);
});

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Central error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Gateway] error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 SmartCity API Gateway running on port ${PORT}`);
});