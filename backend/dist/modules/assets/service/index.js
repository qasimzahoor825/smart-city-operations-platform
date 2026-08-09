"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@smartcity/common");
const repository_1 = require("../repository");
const INSPECTION_CYCLE_DAYS = 90;
const ASSET_STATUSES = [
    client_1.AssetStatus.ACTIVE,
    client_1.AssetStatus.OPERATIONAL,
    client_1.AssetStatus.MAINTENANCE,
    client_1.AssetStatus.UNDER_MAINTENANCE,
    client_1.AssetStatus.DAMAGED,
    client_1.AssetStatus.INACTIVE,
    client_1.AssetStatus.RETIRED,
    client_1.AssetStatus.OUT_OF_SERVICE,
];
const ASSET_CATEGORIES = [
    client_1.AssetCategory.ROAD,
    client_1.AssetCategory.WATER,
    client_1.AssetCategory.ELECTRICITY,
    client_1.AssetCategory.STREET_LIGHT,
    client_1.AssetCategory.PARK,
    client_1.AssetCategory.BUILDING,
    client_1.AssetCategory.PUBLIC_TRANSPORT,
    client_1.AssetCategory.SANITATION,
    client_1.AssetCategory.OTHER,
];
const STAFF_ROLES = [common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN];
function isAssetStatus(value) {
    return typeof value === "string" && ASSET_STATUSES.includes(value);
}
function isAssetCategory(value) {
    return typeof value === "string" && ASSET_CATEGORIES.includes(value);
}
function emptyStatusCount() {
    return {
        [client_1.AssetStatus.ACTIVE]: 0,
        [client_1.AssetStatus.OPERATIONAL]: 0,
        [client_1.AssetStatus.MAINTENANCE]: 0,
        [client_1.AssetStatus.UNDER_MAINTENANCE]: 0,
        [client_1.AssetStatus.DAMAGED]: 0,
        [client_1.AssetStatus.INACTIVE]: 0,
        [client_1.AssetStatus.RETIRED]: 0,
        [client_1.AssetStatus.OUT_OF_SERVICE]: 0,
    };
}
function emptyCategoryCount() {
    return {
        [client_1.AssetCategory.ROAD]: 0,
        [client_1.AssetCategory.WATER]: 0,
        [client_1.AssetCategory.ELECTRICITY]: 0,
        [client_1.AssetCategory.STREET_LIGHT]: 0,
        [client_1.AssetCategory.PARK]: 0,
        [client_1.AssetCategory.BUILDING]: 0,
        [client_1.AssetCategory.PUBLIC_TRANSPORT]: 0,
        [client_1.AssetCategory.SANITATION]: 0,
        [client_1.AssetCategory.OTHER]: 0,
    };
}
function assertCanManageAsset(actor) {
    if (STAFF_ROLES.includes(actor.role))
        return;
    throw new common_1.ForbiddenError("Only staff can manage city assets");
}
exports.assetService = {
    async list(query = {}) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        if (query.category !== undefined && !isAssetCategory(query.category)) {
            throw new common_1.AppError(`Invalid category. Allowed: ${ASSET_CATEGORIES.join(", ")}`, 422);
        }
        if (query.status !== undefined && !isAssetStatus(query.status)) {
            throw new common_1.AppError(`Invalid status. Allowed: ${ASSET_STATUSES.join(", ")}`, 422);
        }
        const q = (query.search ?? "").trim().toLowerCase();
        const items = repository_1.assetRepository.assets.query({
            searchFields: ["name", "address", "department", "maintainedBy"],
            search: q || undefined,
            filter: (a) => (query.category === undefined || a.category === query.category) &&
                (query.status === undefined || a.status === query.status),
            sort: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        });
        const { items: paged, pagination } = (0, common_1.paginate)(items, page, limit);
        return { items: paged, pagination };
    },
    async getById(id) {
        const asset = repository_1.assetRepository.assets.findById(id);
        if (!asset)
            throw new common_1.NotFoundError("Asset not found");
        return asset;
    },
    async create(actor, dto) {
        assertCanManageAsset(actor);
        if (!dto.name || !dto.name.trim())
            throw new common_1.ValidationError({ name: "name is required" });
        if (!dto.department || !dto.department.trim()) {
            throw new common_1.ValidationError({ department: "department is required" });
        }
        const category = dto.category ?? client_1.AssetCategory.OTHER;
        if (!isAssetCategory(category)) {
            throw new common_1.AppError(`Invalid category. Allowed: ${ASSET_CATEGORIES.join(", ")}`, 422);
        }
        const status = dto.status ?? client_1.AssetStatus.OPERATIONAL;
        if (!isAssetStatus(status)) {
            throw new common_1.AppError(`Invalid status. Allowed: ${ASSET_STATUSES.join(", ")}`, 422);
        }
        const now = new Date().toISOString();
        return repository_1.assetRepository.assets.create({
            name: dto.name.trim(),
            category,
            status,
            latitude: dto.latitude ?? null,
            longitude: dto.longitude ?? null,
            address: dto.address?.trim() || null,
            imageUrl: dto.imageUrl?.trim() || null,
            department: dto.department.trim(),
            lastInspectionAt: null,
            nextInspectionAt: null,
            maintainedBy: dto.maintainedBy?.trim() || null,
            lastStatusNote: null,
            createdBy: actor.id,
            updatedBy: actor.id,
            createdAt: now,
            updatedAt: now,
        });
    },
    async updateStatus(id, actor, dto) {
        await this.getById(id);
        assertCanManageAsset(actor);
        if (!isAssetStatus(dto.status)) {
            throw new common_1.AppError(`Invalid status. Allowed: ${ASSET_STATUSES.join(", ")}`, 422);
        }
        const updated = repository_1.assetRepository.assets.update(id, {
            status: dto.status,
            lastStatusNote: dto.note?.trim() || null,
            updatedBy: actor.id,
            updatedAt: new Date().toISOString(),
        });
        if (!updated)
            throw new common_1.NotFoundError("Asset not found");
        return updated;
    },
    async remove(id, actor) {
        const asset = await this.getById(id);
        assertCanManageAsset(actor);
        repository_1.assetRepository.assets.delete(id);
        repository_1.assetRepository.inspections
            .all()
            .filter((i) => i.assetId === id)
            .forEach((i) => repository_1.assetRepository.inspections.delete(i.id));
    },
    async listInspections(assetId) {
        return repository_1.assetRepository.inspections
            .all()
            .filter((i) => i.assetId === assetId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async createInspection(assetId, actor, dto) {
        const asset = await this.getById(assetId);
        assertCanManageAsset(actor);
        if (!dto.status || !dto.status.trim())
            throw new common_1.ValidationError({ status: "status is required" });
        if (!dto.findings || !dto.findings.trim())
            throw new common_1.ValidationError({ findings: "findings is required" });
        const now = new Date();
        const inspection = repository_1.assetRepository.inspections.create({
            assetId,
            inspectorId: actor.id,
            status: dto.status.trim(),
            findings: dto.findings.trim(),
            inspectedBy: actor.email,
            createdAt: now.toISOString(),
        });
        repository_1.assetRepository.assets.update(assetId, {
            lastInspectionAt: now.toISOString(),
            nextInspectionAt: new Date(now.getTime() + INSPECTION_CYCLE_DAYS * 86_400_000).toISOString(),
            updatedBy: actor.id,
            updatedAt: now.toISOString(),
        });
        return inspection;
    },
    async latestInspection(assetId) {
        const inspections = await this.listInspections(assetId);
        return inspections[0] ?? null;
    },
    async stats() {
        const assets = repository_1.assetRepository.assets.all();
        const byStatus = emptyStatusCount();
        const byCategory = emptyCategoryCount();
        for (const a of assets) {
            byStatus[a.status] += 1;
            byCategory[a.category] += 1;
        }
        return { total: assets.length, byStatus, byCategory };
    },
};
exports.default = exports.assetService;
//# sourceMappingURL=index.js.map