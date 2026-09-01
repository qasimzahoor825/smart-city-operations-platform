import { ValidationError } from "../../../core/errors";
import { uid } from "../../../core/utils";
import { readings, sensorById, sensors } from "../store";
import type { Anomaly, AnomalyOverview, IngestDto, IngestResult, Sensor, SensorReading } from "../dto";

const DEFAULT_WINDOW = 30;
const DEFAULT_THRESHOLD = 3.0;
const CRITICAL_THRESHOLD = 4.5;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

interface WindowStats {
  mean: number;
  std: number;
}

function windowStats(values: number[]): WindowStats {
  const n = values.length;
  if (n === 0) return { mean: 0, std: 0 };
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  if (n === 1) return { mean, std: 0 };
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1);
  return { mean, std: Math.sqrt(variance) };
}

function severityOf(zScore: number): Anomaly["severity"] {
  return Math.abs(zScore) >= CRITICAL_THRESHOLD ? "CRITICAL" : "WARNING";
}

function reasonFor(zScore: number, metricName: string): string {
  const direction = zScore >= 0 ? "above" : "below";
  return `${metricName} is ${Math.abs(zScore).toFixed(1)}σ ${direction} the sensor baseline.`;
}

/** Rolling-window z-score detection: each reading is compared to its own past. */
function detectForSensor(ordered: SensorReading[], threshold: number): Anomaly[] {
  const anomalies: Anomaly[] = [];
  for (let i = 0; i < ordered.length; i += 1) {
    const reading = ordered[i];
    const prior = ordered.slice(Math.max(0, i - DEFAULT_WINDOW), i).map((r) => r.metricValue);
    const { mean, std } = windowStats(prior);
    if (std === 0) continue;
    const zScore = (reading.metricValue - mean) / std;
    if (Math.abs(zScore) >= threshold) {
      anomalies.push({
        id: reading.id,
        sensorId: reading.sensorId,
        sensorName: reading.sensorName,
        sensorType: reading.sensorType,
        metricName: reading.metricName,
        metricValue: reading.metricValue,
        unit: reading.unit,
        expectedMean: round2(mean),
        expectedStd: round2(std),
        zScore: round2(zScore),
        severity: severityOf(zScore),
        reason: reasonFor(zScore, reading.metricName),
        detectedAt: reading.timestamp,
        latitude: reading.latitude,
        longitude: reading.longitude,
      });
    }
  }
  return anomalies;
}

function allAnomalies(threshold: number): Anomaly[] {
  const bySensor = new Map<string, SensorReading[]>();
  for (const reading of [...readings].sort((a, b) => a.timestamp.localeCompare(b.timestamp))) {
    const list = bySensor.get(reading.sensorId) ?? [];
    list.push(reading);
    bySensor.set(reading.sensorId, list);
  }
  const anomalies: Anomaly[] = [];
  for (const list of bySensor.values()) anomalies.push(...detectForSensor(list, threshold));
  return anomalies.sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

export const iotService = {
  sensors(): Sensor[] {
    return sensors;
  },

  live(): SensorReading[] {
    const latest = new Map<string, SensorReading>();
    for (const reading of readings) {
      const previous = latest.get(reading.sensorId);
      if (!previous || reading.timestamp > previous.timestamp) latest.set(reading.sensorId, reading);
    }
    return [...latest.values()].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  },

  readingsFor(sensorId: string, limit = 120): SensorReading[] {
    return readings
      .filter((r) => r.sensorId === sensorId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, Math.min(500, Math.max(1, limit)));
  },

  anomalies(limit = 50, threshold = DEFAULT_THRESHOLD): Anomaly[] {
    return allAnomalies(threshold).slice(0, Math.min(200, Math.max(1, limit)));
  },

  anomalyOverview(): AnomalyOverview {
    const anomalies = allAnomalies(DEFAULT_THRESHOLD);
    const critical = anomalies.filter((a) => a.severity === "CRITICAL").length;
    const bySensorType = new Map<string, number>();
    for (const anomaly of anomalies) {
      bySensorType.set(anomaly.sensorType, (bySensorType.get(anomaly.sensorType) ?? 0) + 1);
    }
    return {
      total: anomalies.length,
      critical,
      warning: anomalies.length - critical,
      activeSensors: new Set(anomalies.map((a) => a.sensorId)).size,
      bySensorType: [...bySensorType.entries()]
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count),
      latest: anomalies.slice(0, 10),
      generatedAt: new Date().toISOString(),
    };
  },

  ingest(dto: IngestDto): IngestResult {
    const sensor = sensorById(dto.sensorId);
    if (!sensor) {
      throw new ValidationError({ sensorId: `Unknown sensor: ${dto.sensorId}` });
    }
    const reading: SensorReading = {
      id: uid(),
      sensorId: sensor.id,
      sensorName: sensor.name,
      sensorType: sensor.type,
      metricName: sensor.metricName,
      metricValue: dto.metricValue,
      unit: sensor.unit,
      latitude: sensor.latitude,
      longitude: sensor.longitude,
      timestamp: new Date().toISOString(),
    };
    const history = readings
      .filter((r) => r.sensorId === sensor.id)
      .slice(-DEFAULT_WINDOW)
      .map((r) => r.metricValue);
    readings.push(reading);

    const { mean, std } = windowStats(history);
    if (std === 0) return { reading, anomaly: null };
    const zScore = (reading.metricValue - mean) / std;
    if (Math.abs(zScore) < DEFAULT_THRESHOLD) return { reading, anomaly: null };

    const anomaly: Anomaly = {
      id: reading.id,
      sensorId: reading.sensorId,
      sensorName: reading.sensorName,
      sensorType: reading.sensorType,
      metricName: reading.metricName,
      metricValue: reading.metricValue,
      unit: reading.unit,
      expectedMean: round2(mean),
      expectedStd: round2(std),
      zScore: round2(zScore),
      severity: severityOf(zScore),
      reason: reasonFor(zScore, reading.metricName),
      detectedAt: reading.timestamp,
      latitude: reading.latitude,
      longitude: reading.longitude,
    };
    return { reading, anomaly };
  },
};

export default iotService;
