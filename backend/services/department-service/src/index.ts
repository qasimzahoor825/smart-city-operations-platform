import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import {
  uid,
  AppError,
  EmergencyStatus,
  EmergencyType,
  AssetStatus,
  AssetCategory,
  AppointmentStatus,
  UserRole,
  paginate,
} from "@smartcity/common";

// ============ In-memory stores ============
interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}
interface Officer {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
  departmentName?: string;
  active: boolean;
}
interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  department: string;
  imageUrl?: string;
  lastInspection?: string;
  nextInspection?: string;
}
interface Emergency {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  status: EmergencyStatus;
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  reportedBy: string;
  timeline: string[];
  createdAt: string;
  updatedAt: string;
}
interface Appointment {
  id: string;
  title: string;
  scheduledAt: string;
  status: AppointmentStatus;
  citizenId?: string | null;
  department: string;
  citizenName?: string;
}
interface Inspection {
  id: string;
  assetId: string;
  status: string;
  findings: string;
  inspector: string;
  date: string;
}

const departments: Department[] = [
  { id: "dept-public-works", name: "Public Works", code: "PW", description: "Roads, infrastructure & maintenance.", createdAt: "2026-01-01T00:00:00Z" },
  { id: "dept-water", name: "Water & Sewage", code: "WS", description: "Water supply, drainage and sewage.", createdAt: "2026-01-01T00:00:00Z" },
  { id: "dept-power", name: "Power & Lighting", code: "PL", description: "Electricity distribution & street lights.", createdAt: "2026-01-01T00:00:00Z" },
  { id: "dept-sanitation", name: "Sanitation", code: "SA", description: "Waste collection & city hygiene.", createdAt: "2026-01-01T00:00:00Z" },
  { id: "dept-parks", name: "Parks & Recreation", code: "PR", description: "Public parks and green spaces.", createdAt: "2026-01-01T00:00:00Z" },
];

const officers: Officer[] = [
  { id: "usr-head-pw", fullName: "Ayesha Khan", email: "head@publicworks.gov", role: UserRole.DEPARTMENT_HEAD, departmentId: "dept-public-works", departmentName: "Public Works", active: true },
  { id: "usr-off-pw1", fullName: "Bilal Ahmed", email: "officer@publicworks.gov", role: UserRole.OFFICER, departmentId: "dept-public-works", departmentName: "Public Works", active: true },
  { id: "usr-off-pw2", fullName: "Cara Diaz", email: "cara@smartcity.gov", role: UserRole.OFFICER, departmentId: "dept-public-works", departmentName: "Public Works", active: true },
  { id: "usr-off-ws1", fullName: "Dana White", email: "dana@smartcity.gov", role: UserRole.OFFICER, departmentId: "dept-water", departmentName: "Water & Sewage", active: true },
];

const assets: Asset[] = [
  { id: "asst-1", name: "Main Street Overpass Light", category: AssetCategory.ROAD, status: AssetStatus.OPERATIONAL, latitude: 24.8607, longitude: 67.0011, address: "Main Street Bridge", department: "Public Works", imageUrl: "", lastInspection: "2026-05-10", nextInspection: "2026-11-10" },
  { id: "asst-2", name: "Water Pump Station B", category: AssetCategory.WATER, status: AssetStatus.UNDER_MAINTENANCE, latitude: 24.871, longitude: 67.001, address: "Industrial Zone 4", department: "Water & Sewage", imageUrl: "", lastInspection: "2026-04-01", nextInspection: "2026-10-01" },
  { id: "asst-3", name: "Clifton Greenway Park", category: AssetCategory.PARK, status: AssetStatus.OPERATIONAL, latitude: 24.8816, longitude: 67.0812, address: "Clifton Greenway", department: "Parks & Recreation", imageUrl: "", lastInspection: "2026-06-12", nextInspection: "2026-09-12" },
  { id: "asst-4", name: "Substation 7", category: AssetCategory.ELECTRICITY, status: AssetStatus.OUT_OF_SERVICE, latitude: 24.833, longitude: 67.031, address: "North District", department: "Power & Lighting", imageUrl: "", lastInspection: "2026-03-09", nextInspection: "2026-09-09" },
];

const emergencies: Emergency[] = [
  { id: "emg-1", type: EmergencyType.FIRE, title: "Apartment fire on Main Street", description: "Apartment block fire, two units affected.", severity: "CRITICAL", status: EmergencyStatus.ON_SCENE, latitude: 24.8607, longitude: 67.0011, address: "Main Street Block 3", reportedBy: "Dispatcher A", timeline: ["2026-08-07T08:00:00Z - Reported", "2026-08-07T08:05:00Z - Dispatched", "2026-08-07T08:20:00Z - On scene"], createdAt: "2026-08-07T08:00:00.000Z", updatedAt: "2026-08-07T08:20:00.000Z" },
  { id: "emg-2", type: EmergencyType.FLOOD, title: "Street flooding in low-lying zone", description: "Heavy rainfall causing waterlogging.", severity: "HIGH", status: EmergencyStatus.DISPATCHED, latitude: 24.871, longitude: 67.001, address: "Low-Lying Ward 5", reportedBy: "Citizen", timeline: ["2026-08-07T09:00:00Z - Reported", "2026-08-07T09:10:00Z - Dispatched"], createdAt: "2026-08-07T09:00:00.000Z", updatedAt: "2026-08-07T09:10:00.000Z" },
  { id: "emg-3", type: EmergencyType.MEDICAL, title: "Road accident on Flower Road", description: "Two-vehicle collision, minor injuries.", severity: "MEDIUM", status: EmergencyStatus.REPORTED, latitude: 24.8816, longitude: 67.0812, address: "Flower Road", reportedBy: "Emergency 911", timeline: ["2026-08-07T09:30:00Z - Reported"], createdAt: "2026-08-07T09:30:00.000Z", updatedAt: "2026-08-07T09:30:00.000Z" },
];

const appointments: Appointment[] = [
  { id: "appt-1", title: "Property tax enquiry", scheduledAt: "2026-08-10T10:00:00.000Z", status: AppointmentStatus.CONFIRMED, citizenId: "usr_seed_citizen1", department: "Public Works", citizenName: "Sarah Jenkins" },
  { id: "appt-2", title: "New water connection", scheduledAt: "2026-08-12T14:00:00.000Z", status: AppointmentStatus.PENDING, citizenId: "usr_seed_citizen1", department: "Water & Sewage", citizenName: "Sarah Jenkins" },
];

const inspections: Inspection[] = [
  { id: "insp-1", assetId: "asst-2", status: "PARTIAL", findings: "Pump bearings worn; schedule replacement.", inspector: "Bilal Ahmed", date: "2026-04-01" },
  { id: "insp-2", assetId: "asst-3", status: "GOOD", findings: "Playground equipment in good condition.", inspector: "Cara Diaz", date: "2026-06-12" },
];

const app = express();
const PORT = Number(process.env.PORT || 4007);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ service: "Department & Operations Service", status: "UP", timestamp: new Date().toISOString() });
});

// ===================== Departments =====================
app.get("/departments", (_req, res) => {
  res.json({ success: true, data: departments, timestamp: new Date().toISOString() });
});
app.post("/departments", (req, res, next) => {
  try {
    const { name, code, description } = req.body ?? {};
    if (!name || !code) throw new AppError("name and code are required", 422);
    const d: Department = { id: uid("dept"), name, code, description: description || "", createdAt: new Date().toISOString() };
    departments.push(d);
    res.status(201).json({ success: true, message: "Department created", data: d });
  } catch (e) { next(e); }
});
app.get("/departments/:id/stats", (req, res) => {
  const d = departments.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ success: false, message: "Not found" });
  const staff = officers.filter((o) => o.departmentId === d.id);
  res.json({
    success: true,
    data: { department: d, staffCount: staff.length, activeCount: staff.filter((o) => o.active).length },
  });
});

// ===================== Officers / Users =====================
app.post("/users", (req, res, next) => {
  try {
    const { fullName, email, role, departmentId, active } = req.body ?? {};
    if (!fullName || !email) throw new AppError("fullName and email are required", 422);
    const dept = departments.find((d) => d.id === departmentId);
    const officer: Officer = {
      id: uid("usr"),
      fullName,
      email,
      role: (role as UserRole) || UserRole.OFFICER,
      departmentId: dept?.id ?? null,
      departmentName: dept?.name,
      active: active !== false,
    };
    officers.push(officer);
    res.status(201).json({ success: true, message: "User provisioned", data: officer });
  } catch (e) { next(e); }
});
app.get("/users", (req, res) => {
  const { role, departmentId, search, page = 1, limit = 20 } = req.query;
  let items = [...officers];
  if (role) items = items.filter((o) => o.role === role);
  if (departmentId) items = items.filter((o) => o.departmentId === departmentId);
  if (search) items = items.filter((o) => o.fullName.toLowerCase().includes(String(search).toLowerCase()));
  const { items: slice, pagination } = paginate(items, Number(page), Number(limit));
  res.json({ success: true, data: slice, pagination, timestamp: new Date().toISOString() });
});
app.patch("/users/:id/status", (req, res, next) => {
  const officer = officers.find((o) => o.id === req.params.id);
  if (!officer) return next(new AppError("Officer not found", 404));
  officer.active = req.body?.active ?? officer.active;
  res.json({ success: true, message: "Officer updated", data: officer });
});

// ===================== Assets =====================
app.get("/assets", (req, res) => {
  const { category, status, search } = req.query;
  let items = [...assets];
  if (category) items = items.filter((a) => a.category === category);
  if (status) items = items.filter((a) => a.status === status);
  if (search) items = items.filter((a) => a.name.toLowerCase().includes(String(search).toLowerCase()));
  res.json({ success: true, data: items, timestamp: new Date().toISOString() });
});
app.get("/assets/stats", (_req, res) => {
  res.json({
    success: true,
    data: {
      total: assets.length,
      byStatus: Object.values(AssetStatus).map((s) => ({ status: s, count: assets.filter((a) => a.status === s).length })),
      byCategory: Object.values(AssetCategory).map((c) => ({ category: c, count: assets.filter((a) => a.category === c).length })),
    },
    timestamp: new Date().toISOString(),
  });
});
app.post("/assets", (req, res, next) => {
  try {
    const { name, category, status, latitude, longitude, address, department } = req.body ?? {};
    if (!name) throw new AppError("name is required", 422);
    const asset: Asset = {
      id: uid("asst"), name,
      category: (category as AssetCategory) || AssetCategory.OTHER,
      status: (status as AssetStatus) || AssetStatus.OPERATIONAL,
      latitude: latitude ?? null, longitude: longitude ?? null,
      address: address || "", department: department || "Public Works", imageUrl: "",
      lastInspection: "", nextInspection: "",
    };
    assets.push(asset);
    res.status(201).json({ success: true, message: "Asset created", data: asset });
  } catch (e) { next(e); }
});
app.patch("/assets/:id/status", (req, res, next) => {
  const asset = assets.find((a) => a.id === req.params.id);
  if (!asset) return next(new AppError("Asset not found", 404));
  asset.status = req.body?.status ?? asset.status;
  res.json({ success: true, message: "Asset status updated", data: asset });
});
app.get("/assets/:id/inspections", (req, res) => {
  res.json({ success: true, data: inspections.filter((i) => i.assetId === req.params.id), timestamp: new Date().toISOString() });
});

// ===================== Emergencies =====================
app.get("/emergencies", (_req, res) => {
  res.json({ success: true, data: [...emergencies].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), timestamp: new Date().toISOString() });
});
app.post("/emergencies", (req, res, next) => {
  try {
    const { type, title, description, severity, latitude, longitude, address } = req.body ?? {};
    if (!title || !type) throw new AppError("title and type are required", 422);
    const now = new Date();
    const emg: Emergency = {
      id: uid("emg"), type, title, description: description || "",
      severity: severity || "HIGH", status: EmergencyStatus.REPORTED,
      latitude: latitude ?? null, longitude: longitude ?? null, address: address || "",
      reportedBy: "Citizen", timeline: [`${now.toISOString()} - Reported`],
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    };
    emergencies.push(emg);
    res.status(201).json({ success: true, message: "Emergency reported", data: emg });
  } catch (e) { next(e); }
});
app.patch("/emergencies/:id/dispatch", (req, res, next) => {
  const emg = emergencies.find((e) => e.id === req.params.id);
  if (!emg) return next(new AppError("Emergency not found", 404));
  const { status, note } = req.body ?? {};
  if (status && (Object.values(EmergencyStatus) as string[]).includes(status)) {
    emg.status = status as EmergencyStatus;
    emg.timeline.push(`${new Date().toISOString()} - ${status}`);
  }
  if (note) emg.timeline.push(`${new Date().toISOString()} - ${note}`);
  emg.updatedAt = new Date().toISOString();
  res.json({ success: true, message: "Dispatch updated", data: emg });
});
app.get("/emergencies/stats", (_req, res) => {
  res.json({
    success: true,
    data: Object.values(EmergencyStatus).map((s) => ({ status: s, count: emergencies.filter((e) => e.status === s).length })),
    timestamp: new Date().toISOString(),
  });
});

// ===================== Appointments =====================
app.get("/appointments", (req, res) => {
  const { citizenId } = req.query;
  const items = citizenId ? appointments.filter((a) => a.citizenId === citizenId) : appointments;
  res.json({ success: true, data: items, timestamp: new Date().toISOString() });
});
app.post("/appointments", (req, res, next) => {
  try {
    const { title, scheduledAt, department, citizenId, citizenName } = req.body ?? {};
    if (!title || !scheduledAt) throw new AppError("title and scheduledAt are required", 422);
    const a: Appointment = { id: uid("appt"), title, scheduledAt, status: AppointmentStatus.PENDING, department: department || "Public Works", citizenId, citizenName };
    appointments.push(a);
    res.status(201).json({ success: true, message: "Appointment booked", data: a });
  } catch (e) { next(e); }
});
app.patch("/appointments/:id", (req, res, next) => {
  const a = appointments.find((x) => x.id === req.params.id);
  if (!a) return next(new AppError("Appointment not found", 404));
  if (req.body?.status) a.status = (req.body.status as AppointmentStatus) || a.status;
  res.json({ success: true, data: a });
});

// ===================== Reports / Overview =====================
app.get("/reports/overview", (_req, res) => {
  res.json({
    success: true,
    data: {
      departments: departments.length,
      officers: officers.length,
      assets: assets.length,
      emergenciesActive: emergencies.filter((e) => e.status !== EmergencyStatus.RESOLVED).length,
      appointments: appointments.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 + error handler
app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error("[Ops] error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🏢 Department & Operations Service on port ${PORT}`);
});