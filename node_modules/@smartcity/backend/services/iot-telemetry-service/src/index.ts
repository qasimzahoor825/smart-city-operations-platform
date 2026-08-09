import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { AppError } from "@smartcity/common";

interface Reading {
  id: string;
  sensorId: string;
  sensorType: string;
  metricName: string;
  metricValue: number;
  unit: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}
interface Sensor {
  id: string;
  type: string;
  name: string;
  latitude: number;
  longitude: number;
  unit: string;
}

const sensors: Sensor[] = [
  { id: "s-air-01", type: "AIR_QUALITY", name: "AQI Node 01", latitude: 24.8607, longitude: 67.0011, unit: "AQI" },
  { id: "s-air-02", type: "AIR_QUALITY", name: "AQI Node 02", latitude: 24.871, longitude: 67.001, unit: "AQI" },
  { id: "s-wat-01", type: "WATER_TELEMETRY", name: "Water Tank 01", latitude: 24.8816, longitude: 67.0812, unit: "%" },
  { id: "s-lit-01", type: "SMART_LIGHTING", name: "Smart Pole 01", latitude: 24.866, longitude: 67.003, unit: "on" },
];

const readings: Reading[] = [];
function pushReading() {
  const sources = [
    { s: sensors[0], metricName: "airQualityIndex", base: 40, jitter: 30 },
    { s: sensors[1], metricName: "airQualityIndex", base: 62, jitter: 20 },
    { s: sensors[2], metricName: "waterLevel", base: 78, jitter: 8 },
    { s: sensors[3], metricName: "powerStatus", base: 1, jitter: 0 },
  ];
  const t = new Date().toISOString();
  sources.forEach(({ s, metricName, base, jitter }) => {
    readings.push({
      id: "rd-" + Math.random().toString(36).slice(2, 10),
      sensorId: s.id,
      sensorType: s.type,
      metricName,
      metricValue: Math.round((base + (Math.random() - 0.5) * jitter) * 10) / 10,
      unit: s.unit,
      latitude: s.latitude,
      longitude: s.longitude,
      timestamp: t,
    });
  });
}
pushReading();

const app = express();
const PORT = Number(process.env.PORT || 4005);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ service: "IoT Telemetry Service", status: "UP", timestamp: new Date().toISOString() });
});

app.get("/readings/live", (_req, res) => {
  const latest = sensors.map((s) => {
    const last = [...readings].reverse().find((r) => r.sensorId === s.id);
    return last ? { ...last, sensorName: s.name } : { sensorId: s.id, sensorName: s.name, sensorType: s.type, latitude: s.latitude, longitude: s.longitude, metricValue: null, unit: s.unit, timestamp: null };
  });
  res.json({ success: true, data: latest, timestamp: new Date().toISOString() });
});

app.get("/sensors", (_req, res) => {
  res.json({ success: true, data: sensors, timestamp: new Date().toISOString() });
});

app.get("/readings/:sensorId", (req, res) => {
  const list = readings.filter((r) => r.sensorId === req.params.sensorId).slice(-120);
  res.json({ success: true, data: list, timestamp: new Date().toISOString() });
});

app.post("/ingest", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sensorId, sensorType, metricName, metricValue, unit, latitude, longitude } = req.body ?? {};
    if (!sensorId || metricValue === undefined) throw new AppError("sensorId and metricValue are required", 422);
    const reading: Reading = {
      id: "rd-" + Math.random().toString(36).slice(2, 10),
      sensorId,
      sensorType: sensorType || "GENERIC",
      metricName: metricName || "value",
      metricValue: Number(metricValue),
      unit: unit || "",
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      timestamp: new Date().toISOString(),
    };
    readings.push(reading);
    res.status(201).json({ success: true, message: "Reading ingested", data: reading });
  } catch (e) { next(e); }
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
  console.log(`📡 IoT Telemetry Service on port ${PORT}`);
});