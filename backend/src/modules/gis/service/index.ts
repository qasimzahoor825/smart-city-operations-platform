import {
  AppError,
  NotFoundError,
  paginate,
  type Pagination,
} from "@smartcity/common";
import {
  gisRepository,
  type StoredGisMarker,
} from "../repository";
import {
  MARKER_TYPES,
  type Actor,
  type CityLayer,
  type CreateMarkerDto,
  type MarkerQuery,
  type MarkerStats,
  type MarkerType,
} from "../dto";
import { complaintRepository } from "../../complaints";
import { emergencyRepository } from "../../emergency";

function isMarkerType(value: unknown): value is MarkerType {
  return typeof value === "string" && (MARKER_TYPES as string[]).includes(value);
}

function emptyTypeCount(): Record<MarkerType, number> {
  return {
    complaint: 0,
    asset: 0,
    hospital: 0,
    police: 0,
    emergency: 0,
  };
}

/**
 * Build the live marker set: seeded GIS markers (hospitals, police, assets…)
 * plus every complaint and emergency that carries coordinates. This makes the
 * map reflect real-time data — a complaint/emergency created through the API
 * appears automatically on the next poll.
 */
function liveMarkers(): StoredGisMarker[] {
  const seeded = gisRepository.markers.all();

  const complaintMarkers: StoredGisMarker[] = complaintRepository.complaints
    .all()
    .filter((c) => c.latitude !== undefined && c.latitude !== null && c.longitude !== undefined && c.longitude !== null)
    .map((c) => ({
      id: `cmp:${c.id}`,
      type: "complaint",
      title: c.title,
      latitude: c.latitude as number,
      longitude: c.longitude as number,
      status: c.status,
      severity: c.priority,
      address: c.address ?? null,
      sourceId: c.citizenId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

  const emergencyMarkers: StoredGisMarker[] = emergencyRepository.emergencies
    .all()
    .filter((e) => e.latitude !== undefined && e.latitude !== null && e.longitude !== undefined && e.longitude !== null)
    .map((e) => ({
      id: `emg:${e.id}`,
      type: "emergency",
      title: e.title,
      latitude: e.latitude as number,
      longitude: e.longitude as number,
      status: e.status,
      severity: e.severity,
      address: e.address ?? null,
      sourceId: e.reportedById ?? null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

  return [...seeded, ...complaintMarkers, ...emergencyMarkers];
}

function matchesQuery(m: StoredGisMarker, query: MarkerQuery): boolean {
  let ok = query.type === undefined || m.type === query.type;
  if (query.status !== undefined) ok = ok && (m.status ?? "") === query.status;
  if (query.bbox !== undefined) {
    const [minLon, minLat, maxLon, maxLat] = query.bbox;
    ok =
      ok &&
      m.longitude >= minLon &&
      m.longitude <= maxLon &&
      m.latitude >= minLat &&
      m.latitude <= maxLat;
  }
  return ok;
}

function matchesSearch(m: StoredGisMarker, q: string): boolean {
  if (!q) return true;
  return [m.title, m.address ?? "", m.status ?? "", m.severity ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export const gisService = {
  async listLayers(): Promise<CityLayer[]> {
    return gisRepository.layers.all();
  },

  async listMarkers(query: MarkerQuery = {}): Promise<{ items: StoredGisMarker[]; pagination: Pagination }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    if (query.type !== undefined && !isMarkerType(query.type)) {
      throw new AppError(`Invalid marker type. Allowed: ${MARKER_TYPES.join(", ")}`, 422);
    }
    const q = (query.search ?? "").trim().toLowerCase();
    const items = liveMarkers()
      .filter((m) => matchesQuery(m, { ...query, search: undefined }) && matchesSearch(m, q))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged, pagination };
  },

  async getMarkerById(id: string): Promise<StoredGisMarker> {
    const marker = liveMarkers().find((m) => m.id === id);
    if (!marker) throw new NotFoundError("Marker not found");
    return marker;
  },

  async createMarker(actor: Actor, dto: CreateMarkerDto): Promise<StoredGisMarker> {
    if (!isMarkerType(dto.type)) {
      throw new AppError(`Invalid marker type. Allowed: ${MARKER_TYPES.join(", ")}`, 422);
    }
    const now = new Date().toISOString();
    return gisRepository.markers.create({
      type: dto.type,
      title: dto.title.trim(),
      latitude: dto.latitude,
      longitude: dto.longitude,
      status: dto.status?.trim() || null,
      severity: dto.severity?.trim() || null,
      address: dto.address?.trim() || null,
      sourceId: actor.id,
      createdAt: now,
      updatedAt: now,
    } as unknown as StoredGisMarker);
  },

  async markerStats(): Promise<MarkerStats> {
    const markers = liveMarkers();
    const byType = emptyTypeCount();
    for (const m of markers) byType[m.type] += 1;
    return { total: markers.length, byType };
  },

  async search(q: string): Promise<StoredGisMarker[]> {
    const trimmed = (q ?? "").trim();
    if (!trimmed) return [];
    const lower = trimmed.toLowerCase();
    return liveMarkers()
      .filter((m) => matchesSearch(m, lower))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
};

export default gisService;