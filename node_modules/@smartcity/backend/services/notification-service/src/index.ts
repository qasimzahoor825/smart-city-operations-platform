import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { uid, AppError, NotificationType, paginate } from "@smartcity/common";

interface Notification {
  id: string;
  type: NotificationType;
  userId?: string | null;
  title: string;
  message: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
}
interface NotificationPrefs {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: string[];
}

const now = new Date();
const db: Notification[] = [
  { id: "ntf-1", type: NotificationType.SYSTEM, userId: "usr_seed_citizen1", title: "Welcome to SmartCity OS", message: "Your citizen account is ready.", channel: "IN_APP", isRead: true, createdAt: new Date(now.getTime() - 3600_000).toISOString() },
  { id: "ntf-2", type: NotificationType.IN_APP, userId: "usr_seed_citizen1", title: "Complaint update", message: "Complaint CMP-123 is now IN_PROGRESS.", channel: "IN_APP", isRead: false, createdAt: new Date(now.getTime() - 1800_000).toISOString() },
  { id: "ntf-3", type: NotificationType.EMAIL, userId: "usr_seed_citizen1", title: "Payment receipt", message: "Your water bill payment was confirmed.", channel: "EMAIL", isRead: false, createdAt: new Date(now.getTime() - 600_000).toISOString() },
];

const prefs: NotificationPrefs[] = [
  { userId: "usr_seed_citizen1", email: true, push: true, sms: false, categories: ["complaints", "billing", "emergencies"] },
];

const app = express();
const PORT = Number(process.env.PORT || 4006);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ service: "Notification Service", status: "UP", timestamp: new Date().toISOString() });
});

const sender = { name: "SmartCity Notifications", transport: process.env.EMAIL_TRANSPORT || "mock-console" };

// Send a notification across channels (mock transport).
app.post("/notifications/send", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, title, message, type, channel, payload } = req.body ?? {};
    if (!title || !message) throw new AppError("title and message are required", 422);
    const n: Notification = {
      id: uid("ntf"),
      type: (type as NotificationType) || "IN_APP",
      userId: userId ?? null,
      title,
      message,
      channel: channel || "IN_APP",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    db.unshift(n);
    console.log(`[${sender.transport}] dispatched '${title}' over ${n.channel} to ${userId ?? "all"}`);
    res.status(201).json({ success: true, message: "Notification dispatched", data: n, payload: payload ?? null });
  } catch (e) { next(e); }
});

// List notifications for a user (channel = IN_APP history).
app.get("/notifications", (req, res) => {
  const { userId, unread, page = 1, limit = 20 } = req.query;
  let items = userId ? db.filter((n) => n.userId === userId) : db;
  if (unread === "true") items = items.filter((n) => !n.isRead);
  items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const { items: slice, pagination } = paginate(items, Number(page), Number(limit));
  res.json({ success: true, data: slice, pagination, timestamp: new Date().toISOString() });
});

app.get("/notifications/unread-count", (req, res) => {
  const userId = String(req.query.userId || "");
  const unread = db.filter((n) => (userId ? n.userId === userId : true) && !n.isRead).length;
  res.json({ success: true, data: { unread }, timestamp: new Date().toISOString() });
});

app.patch("/notifications/:id/read", (req, res, next) => {
  const n = db.find((x) => x.id === req.params.id);
  if (!n) return next(new AppError("Notification not found", 404));
  n.isRead = true;
  res.json({ success: true, data: n });
});

app.post("/notifications/read-all", (req, res) => {
  const userId = req.body?.userId;
  db.forEach((n) => { if (!userId || n.userId === userId) n.isRead = true; });
  res.json({ success: true, message: "All marked as read" });
});

// Preferences
app.get("/notifications/preferences", (req, res) => {
  const userId = String(req.query.userId || "");
  const userPrefs = prefs.find((p) => p.userId === userId);
  res.json({ success: true, data: userPrefs || { userId, email: true, push: true, sms: false, categories: [] } });
});
app.put("/notifications/preferences", (req, res) => {
  const { userId, email, push, sms, categories } = req.body ?? {};
  const idx = prefs.findIndex((p) => p.userId === userId);
  const value = { userId, email: Boolean(email), push: Boolean(push), sms: Boolean(sms), categories: categories || [] };
  if (idx >= 0) prefs[idx] = value; else prefs.push(value);
  res.json({ success: true, message: "Preferences saved", data: value });
});

app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`📣 Notification Service on port ${PORT}`);
});