export type SensorType =
  | "WATER_LEVEL"
  | "AIR_QUALITY"
  | "SMART_LIGHTING"
  | "FLOOD_GAUGE"
  | "TRAFFIC_FLOW"
  | "ENERGY_GRID";

export interface Sensor {
  id: string;
  type: SensorType | string;
  name: string;
  metricName: string;
  unit: string;
  latitude: number;
  longitude: number;
  zone: string;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  sensorName: string;
  sensorType: string;
  metricName: string;
  metricValue: number;
  unit: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Anomaly {
  id: string;
  sensorId: string;
  sensorName: string;
  sensorType: string;
  metricName: string;
  metricValue: number;
  unit: string;
  expectedMean: number;
  expectedStd: number;
  zScore: number;
  severity: "WARNING" | "CRITICAL";
  reason: string;
  detectedAt: string;
  latitude: number;
  longitude: number;
}

export interface AnomalyOverview {
  total: number;
  critical: number;
  warning: number;
  activeSensors: number;
  bySensorType: { key: string; count: number }[];
  latest: Anomaly[];
  generatedAt: string;
}

export interface IngestDto {
  sensorId: string;
  metricValue: number;
}

export interface IngestResult {
  reading: SensorReading;
  anomaly: Anomaly | null;
}
