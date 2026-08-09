"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gisService = void 0;
const common_1 = require("@smartcity/common");
const repository_1 = require("../repository");
const dto_1 = require("../dto");
const complaints_1 = require("../../complaints");
const emergency_1 = require("../../emergency");
function isMarkerType(value) {
    return typeof value === "string" && dto_1.MARKER_TYPES.includes(value);
}
function emptyTypeCount() {
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
function liveMarkers() {
    const seeded = repository_1.gisRepository.markers.all();
    const complaintMarkers = complaints_1.complaintRepository.complaints
        .all()
        .filter((c) => c.latitude !== undefined && c.latitude !== null && c.longitude !== undefined && c.longitude !== null)
        .map((c) => ({
        id: `cmp:${c.id}`,
        type: "complaint",
        title: c.title,
        latitude: c.latitude,
        longitude: c.longitude,
        status: c.status,
        severity: c.priority,
        address: c.address ?? null,
        sourceId: c.citizenId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    }));
    const emergencyMarkers = emergency_1.emergencyRepository.emergencies
        .all()
        .filter((e) => e.latitude !== undefined && e.latitude !== null && e.longitude !== undefined && e.longitude !== null)
        .map((e) => ({
        id: `emg:${e.id}`,
        type: "emergency",
        title: e.title,
        latitude: e.latitude,
        longitude: e.longitude,
        status: e.status,
        severity: e.severity,
        address: e.address ?? null,
        sourceId: e.reportedById ?? null,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
    }));
    return [...seeded, ...complaintMarkers, ...emergencyMarkers];
}
function matchesQuery(m, query) {
    let ok = query.type === undefined || m.type === query.type;
    if (query.status !== undefined)
        ok = ok && (m.status ?? "") === query.status;
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
function matchesSearch(m, q) {
    if (!q)
        return true;
    return [m.title, m.address ?? "", m.status ?? "", m.severity ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
}
exports.gisService = {
    async listLayers() {
        return repository_1.gisRepository.layers.all();
    },
    async listMarkers(query = {}) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 100;
        if (query.type !== undefined && !isMarkerType(query.type)) {
            throw new common_1.AppError(`Invalid marker type. Allowed: ${dto_1.MARKER_TYPES.join(", ")}`, 422);
        }
        const q = (query.search ?? "").trim().toLowerCase();
        const items = liveMarkers()
            .filter((m) => matchesQuery(m, { ...query, search: undefined }) && matchesSearch(m, q))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged, pagination };
    },
    async getMarkerById(id) {
        const marker = liveMarkers().find((m) => m.id === id);
        if (!marker)
            throw new common_1.NotFoundError("Marker not found");
        return marker;
    },
    async createMarker(actor, dto) {
        if (!isMarkerType(dto.type)) {
            throw new common_1.AppError(`Invalid marker type. Allowed: ${dto_1.MARKER_TYPES.join(", ")}`, 422);
        }
        const now = new Date().toISOString();
        return repository_1.gisRepository.markers.create({
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
        });
    },
    async markerStats() {
        const markers = liveMarkers();
        const byType = emptyTypeCount();
        for (const m of markers)
            byType[m.type] += 1;
        return { total: markers.length, byType };
    },
    async search(q) {
        const trimmed = (q ?? "").trim();
        if (!trimmed)
            return [];
        const lower = trimmed.toLowerCase();
        return liveMarkers()
            .filter((m) => matchesSearch(m, lower))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
};
exports.default = exports.gisService;
//# sourceMappingURL=index.js.map