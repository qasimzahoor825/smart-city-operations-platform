import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { uid, AppError, ComplaintStatus, ComplaintPriority, paginate } from "@smartcity/common";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  imageUrls: string[];
  slaHours: number;
  slaDeadline?: string;
  resolvedAt?: string;
  citizenId: string;
  assignedToId?: string | null;
  departmentId?: string | null;
  departmentName?: string;
  comments: { id: string; authorId: string; author: string; body: string; createdAt: string }[];
  timeline: {
    status: ComplaintStatus;
    note?: string;
    actorId?: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const DEPARTMENTS: Record<string, string> = {
  ROAD: "Public Works",
  WATER: "Water & Sewage",
  ELECTRICITY: "Power & Lighting",
  GARBAGE: "Sanitation",
  PARKS: "Parks & Recreation",
  STREET_LIGHT: "Power & Lighting",
  NOISE: "Public Safety",
  OTHER: "Public Works",
};

const SLA_HOURS: Record<string, number> = {
  SUBMITTED: 72,
  ASSIGNED: 48,
  IN_PROGRESS: 24,
};

const db: Complaint[] = [];

function seed() {
  const now = Date.now();
  const mk = (
    title: string,
    description: string,
    category: string,
    status: ComplaintStatus,
    priority: ComplaintPriority,
    citizenId: string,
    overrides: Partial<Complaint> = {},
  ): Complaint => ({
    id: uid("cmp"),
    title,
    description,
    category,
    status,
    priority,
    imageUrls: [],
    slaHours: SLA_HOURS[status] ?? 72,
    slaDeadline: new Date(now + 72 * 3600_000).toISOString(),
    citizenId,
    departmentId: DEPARTMENTS[category] ? "dept-" + category.toLowerCase() : null,
    departmentName: DEPARTMENTS[category],
    comments: [],
    timeline: [{ status, note: "Complaint registered", createdAt: new Date(now).toISOString() }],
    createdAt: new Date(now - 2 * 86_400_000).toISOString(),
    updatedAt: new Date(now - 2 * 86_400_000).toISOString(),
    ...overrides,
  });

  db.push(
    mk("Pothole on Main Street", "Large pothole causing traffic hazard near bus stop 12.", "ROAD", ComplaintStatus.IN_PROGRESS, ComplaintPriority.HIGH, "usr_seed_citizen1", { assignedToId: "usr_seed_officer1", latitude: 24.8607, longitude: 67.0011 }),
    mk("Street light not working", "Street light at corner of 5th and Oak has been out for a week.", "STREET_LIGHT", ComplaintStatus.ASSIGNED, ComplaintPriority.MEDIUM, "usr_seed_citizen1", { latitude: 24.871, longitude: 67.001 }),
    mk("Water leak on Maple Ave", "Continuous water leak flooding the sidewalk for 3 days.", "WATER", ComplaintStatus.SUBMITTED, ComplaintPriority.CRITICAL, "usr_seed_citizen2", { latitude: 24.851, longitude: 67.03 }),
    mk("Illegal dumping near park", "Construction debris dumped on park entrance.", "GARBAGE", ComplaintStatus.RESOLVED, ComplaintPriority.LOW, "usr_seed_citizen1", { resolvedAt: new Date(now - 86_400_000).toISOString() }),
  );
}
seed();

const app = express();
const PORT = Number(process.env.PORT || 4002);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ service: "Complaint Service", status: "UP", timestamp: new Date().toISOString() });
});

// -------------------- CRUD --------------------
app.get("/complaints", (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, priority, category, search, citizenId } = req.query;
  let items = [...db].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (status) items = items.filter((c) => c.status === status);
  if (priority) items = items.filter((c) => c.priority === priority);
  if (category) items = items.filter((c) => c.category === category);
  if (citizenId) items = items.filter((c) => c.citizenId === citizenId);
  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  const { items: slice, pagination } = paginate(items, Number(page), Number(limit));
  res.json({ success: true, data: slice, pagination, timestamp: new Date().toISOString() });
});

app.post("/complaints", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, priority, latitude, longitude, address, imageUrls, citizenId } = req.body ?? {};
    if (!title || !description || !category) {
      throw new AppError("title, description and category are required", 422);
    }
    const now = new Date();
    const complaint: Complaint = {
      id: uid("cmp"),
      title,
      description,
      category,
      status: ComplaintStatus.SUBMITTED,
      priority: (priority as ComplaintPriority) || ComplaintPriority.MEDIUM,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      address,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      slaHours: SLA_HOURS.SUBMITTED,
      slaDeadline: new Date(now.getTime() + 72 * 3600_000).toISOString(),
      citizenId: citizenId || req.headers["x-user-id"] || "anonymous",
      departmentId: DEPARTMENTS[category] ? "dept-" + category.toLowerCase() : null,
      departmentName: DEPARTMENTS[category],
      comments: [],
      timeline: [{ status: ComplaintStatus.SUBMITTED, note: "Complaint registered", createdAt: now.toISOString() }],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    db.unshift(complaint);
    res.status(201).json({ success: true, message: "Complaint submitted", data: complaint, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

app.get("/complaints/stats", (_req, res) => {
  const total = db.length;
  const byStatus = Object.values(ComplaintStatus).map((status) => ({
    status,
    count: db.filter((c) => c.status === status).length,
  }));
  const byPriority = Object.values(ComplaintPriority).map((priority) => ({
    priority,
    count: db.filter((c) => c.priority === priority).length,
  }));
  const byCategory = Array.from(new Set(db.map((c) => c.category))).map((category) => ({
    category,
    count: db.filter((c) => c.category === category).length,
  }));
  const resolved = db.filter((c) => c.status === ComplaintStatus.RESOLVED).length;
  const open = total - resolved;
  res.json({
    success: true,
    data: { total, open, resolved, byStatus, byPriority, byCategory },
    timestamp: new Date().toISOString(),
  });
});

app.get("/complaints/:id", (req: Request, res: Response, next: NextFunction) => {
  const complaint = db.find((c) => c.id === req.params.id);
  if (!complaint) return next(new AppError("Complaint not found", 404));
  res.json({ success: true, data: complaint, timestamp: new Date().toISOString() });
});

app.patch("/complaints/:id", (req: Request, res: Response, next: NextFunction) => {
  const complaint = db.find((c) => c.id === req.params.id);
  if (!complaint) return next(new AppError("Complaint not found", 404));
  const allowed = ["title", "description", "category", "priority", "address", "imageUrls"];
  for (const key of allowed) {
    if (req.body?.[key] !== undefined) {
      (complaint as unknown as Record<string, unknown>)[key] = req.body[key];
    }
  }
  complaint.updatedAt = new Date().toISOString();
  res.json({ success: true, message: "Complaint updated", data: complaint, timestamp: new Date().toISOString() });
});

app.delete("/complaints/:id", (req: Request, res: Response, next: NextFunction) => {
  const idx = db.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return next(new AppError("Complaint not found", 404));
  db.splice(idx, 1);
  res.json({ success: true, message: "Complaint deleted", timestamp: new Date().toISOString() });
});

// -------------------- Workflow --------------------
app.post("/complaints/:id/assign", (req: Request, res: Response, next: NextFunction) => {
  const complaint = db.find((c) => c.id === req.params.id);
  if (!complaint) return next(new AppError("Complaint not found", 404));
  const { officerId, departmentId, departmentName } = req.body ?? {};
  complaint.assignedToId = officerId ?? complaint.assignedToId;
  complaint.departmentId = departmentId ?? complaint.departmentId;
  if (departmentName) complaint.departmentName = departmentName;
  if (complaint.status === ComplaintStatus.SUBMITTED) {
    complaint.status = ComplaintStatus.ASSIGNED;
    complaint.slaDeadline = new Date(Date.now() + 48 * 3600_000).toISOString();
    complaint.timeline.push({ status: ComplaintStatus.ASSIGNED, note: `Assigned to ${officerId ?? "officer"}`, createdAt: new Date().toISOString() });
  }
  complaint.updatedAt = new Date().toISOString();
  res.json({ success: true, message: "Complaint assigned", data: complaint, timestamp: new Date().toISOString() });
});

app.post("/complaints/:id/status", (req: Request, res: Response, next: NextFunction) => {
  const complaint = db.find((c) => c.id === req.params.id);
  if (!complaint) return next(new AppError("Complaint not found", 404));
  const { status, note } = req.body ?? {};
  if (!Object.values(ComplaintStatus).includes(status)) {
    return next(new AppError(`Invalid status '${status}'`, 422));
  }
  complaint.status = status;
  if (status === ComplaintStatus.IN_PROGRESS) {
    complaint.slaDeadline = new Date(Date.now() + 24 * 3600_000).toISOString();
  }
  if (status === ComplaintStatus.RESOLVED) {
    complaint.resolvedAt = new Date().toISOString();
  }
  complaint.timeline.push({ status, note, createdAt: new Date().toISOString() });
  complaint.updatedAt = new Date().toISOString();
  res.json({ success: true, message: "Status updated", data: complaint, timestamp: new Date().toISOString() });
});

app.post("/complaints/:id/comments", (req: Request, res: Response, next: NextFunction) => {
  const complaint = db.find((c) => c.id === req.params.id);
  if (!complaint) return next(new AppError("Complaint not found", 404));
  const body = req.body?.body?.trim();
  if (!body) return next(new AppError("Comment body is required", 422));
  complaint.comments.push({
    id: uid("cmt"),
    authorId: req.headers["x-user-id"] as string || "anonymous",
    author: (req.headers["x-user-name"] as string) || "Citizen",
    body,
    createdAt: new Date().toISOString(),
  });
  complaint.updatedAt = new Date().toISOString();
  res.status(201).json({ success: true, message: "Comment added", data: complaint.comments.at(-1), timestamp: new Date().toISOString() });
});

// 404 + error handler
app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error("[Complaint] error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🎫 Complaint Service listening on port ${PORT}`);
});