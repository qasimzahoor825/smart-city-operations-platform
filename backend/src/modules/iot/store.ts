import { uid } from "../../core/utils";
import type { Sensor, SensorReading } from "./dto";

interface SensorDef {
  id: string;
  type: Sensor["type"];
  name: string;
  metricName: string;
  unit: string;
  zone: string;
  lat: number;
  lng: number;
  baseline: number;
  noise: number;
}

const SENSOR_DEFS: SensorDef[] = [
  { id: "sensor-water-01", type: "WATER_LEVEL", name: "North Reservoir Level", metricName: "waterLevel", unit: "m", zone: "North", lat: 33.6844, lng: 73.0479, baseline: 12.5, noise: 0.4 },
  { id: "sensor-water-02", type: "WATER_LEVEL", name: "East Basin Level", metricName: "waterLevel", unit: "m", zone: "East", lat: 33.6944, lng: 73.0879, baseline: 9.2, noise: 0.35 },
  { id: "sensor-air-01", type: "AIR_QUALITY", name: "Downtown AQI Monitor", metricName: "airQualityIndex", unit: "AQI", zone: "Central", lat: 33.7004, lng: 73.0479, baseline: 85, noise: 12 },
  { id: "sensor-air-02", type: "AIR_QUALITY", name: "Industrial Zone AQI", metricName: "airQualityIndex", unit: "AQI", zone: "West", lat: 33.6404, lng: 73.0479, baseline: 150, noise: 20 },
  { id: "sensor-light-01", type: "SMART_LIGHTING", name: "Main Blvd Lighting Grid", metricName: "powerUsage", unit: "kWh", zone: "Central", lat: 33.6994, lng: 73.0579, baseline: 42, noise: 5 },
  { id: "sensor-flood-01", type: "FLOOD_GAUGE", name: "Nulla River Gauge", metricName: "riverLevel", unit: "m", zone: "South", lat: 33.6054, lng: 73.0279, baseline: 3.1, noise: 0.25 },
  { id: "sensor-traffic-01", type: "TRAFFIC_FLOW", name: "Jinnah Ave Flow", metricName: "trafficFlow", unit: "vph", zone: "Central", lat: 33.7094, lng: 73.0679, baseline: 720, noise: 90 },
  { id: "sensor-energy-01", type: "ENERGY_GRID", name: "Substation A Load", metricName: "gridLoad", unit: "MW", zone: "West", lat: 33.6554, lng: 73.0379, baseline: 28, noise: 3.5 },
];

// Box–Muller transform for roughly-normal noise around each sensor baseline.
function gaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export const sensors: Sensor[] = SENSOR_DEFS.map((def) => ({
  id: def.id,
  type: def.type,
  name: def.name,
  metricName: def.metricName,
  unit: def.unit,
  latitude: def.lat,
  longitude: def.lng,
  zone: def.zone,
}));

// Synthetic fault spikes so the statistical detector has real anomalies to surface.
const INJECTED_ANOMALIES: Record<string, { index: number; multiplier: number }[]> = {
  "sensor-air-02": [
    { index: 30, multiplier: 8 },
    { index: 118, multiplier: 9 },
  ],
  "sensor-flood-01": [
    { index: 60, multiplier: 12 },
    { index: 126, multiplier: 10 },
  ],
  "sensor-energy-01": [{ index: 135, multiplier: 6 }],
  "sensor-traffic-01": [{ index: 105, multiplier: 7 }],
};

const STEP_MS = 3 * 60 * 1000;
const READINGS_PER_SENSOR = 140;

function buildReadings(): SensorReading[] {
  const now = Date.now();
  const readings: SensorReading[] = [];
  for (const def of SENSOR_DEFS) {
    const injections = new Map(INJECTED_ANOMALIES[def.id]?.map((a) => [a.index, a]) ?? []);
    for (let i = 0; i < READINGS_PER_SENSOR; i += 1) {
      const cycle = Math.sin((i / 48) * Math.PI * 2) * def.baseline * 0.06;
      let value = def.baseline + cycle + def.noise * gaussian();
      const injection = injections.get(i);
      if (injection) value = def.baseline + def.noise * injection.multiplier;
      readings.push({
        id: uid(),
        sensorId: def.id,
        sensorName: def.name,
        sensorType: def.type,
        metricName: def.metricName,
        metricValue: round2(value),
        unit: def.unit,
        latitude: def.lat,
        longitude: def.lng,
        timestamp: new Date(now - (READINGS_PER_SENSOR - i) * STEP_MS).toISOString(),
      });
    }
  }
  return readings;
}

export const readings: SensorReading[] = buildReadings();

export function sensorById(id: string): Sensor | undefined {
  return sensors.find((s) => s.id === id);
}
