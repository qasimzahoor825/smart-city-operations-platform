import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { AppError } from "@smartcity/common";

interface Marker {
  id: string;
  type: "complaint" | "asset" | "hospital" | "police" | "emergency";
  title: string;
  latitude: number;
  longitude: number;
  status?: string;
  severity?: string;
}
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  description: string;
}

const markers: Marker[] = [
  { id: "m-cmp-1", type: "complaint", title: "Pothole on Main Street", latitude: 24.8607, longitude: 67.0011, status: "IN_PROGRESS", severity: "HIGH" },
  { id: "m-asst-1", type: "asset", title: "Main Street Bridge Light", latitude: 24.861, longitude: 67.0012, status: "OPERATIONAL" },
  { id: "m-hosp-1", type: "hospital", title: "City General Hospital", latitude: 24.874, longitude: 67.021 },
  { id: "m-pol-1", type: "police", title: "Central Police Station", latitude: 24.866, longitude: 67.003 },
  { id: "m-emg-1", type: "emergency", title: "Apartment fire on Main St", latitude: 24.8607, longitude: 67.0011, severity: "CRITICAL" },
];

const layers: Layer[] = [
  { id: "layer-traffic", name: "Traffic Flow", visible: true, color: "#3b82f6", description: "Live traffic density heatmap." },
  { id: "layer-water", name: "Water Network", visible: true, color: "#06b6d4", description: "Water supply & sewage mains." },
  { id: "layer-zoning", name: "Zoning", visible: false, color: "#a855f7", description: "Urban zoning use-cases." },
];

const app = express();
const PORT = Number(process.env.PORT || 4004);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ service: "GIS Service", status: "UP", timestamp: new Date().toISOString() });
});

app.get("/layers", (_req, res) => {
  res.json({ success: true, data: layers, timestamp: new Date().toISOString() });
});

app.get("/markers", (req, res) => {
  const { type, bbox } = req.query;
  let items = markers;
  if (type) items = items.filter((m) => m.type === type);
  if (bbox) {
    const [minLon, minLat, maxLon, maxLat] = String(bbox).split(",").map(Number);
    items = items.filter((m) => m.longitude >= minLon && m.longitude <= maxLon && m.latitude >= minLat && m.latitude <= maxLat);
  }
  res.json({ success: true, data: items, timestamp: new Date().toISOString() });
});

app.get("/markers/stats", (_req, res) => {
  const counts = markers.reduce<Record<string, number>>((acc, m) => {
    acc[m.type] = (acc[m.type] ?? 0) + 1;
    return acc;
  }, {});
  res.json({ success: true, data: counts, timestamp: new Date().toISOString() });
});

// Search across markers by title.
app.get("/search", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const results = q ? markers.filter((m) => m.title.toLowerCase().includes(q)) : [];
  res.json({ success: true, data: results, timestamp: new Date().toISOString() });
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
  console.log(`🗺️ GIS & Spatial Service on port ${PORT}`);
});