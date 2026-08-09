import { AssetCategory, AssetStatus } from "@prisma/client";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  UserRole,
  ValidationError,
  paginate,
  type Pagination,
} from "@smartcity/common";
import {
  assetRepository,
  type StoredAsset,
  type StoredAssetInspection,
} from "../repository";
import type {
  Actor,
  AssetQuery,
  AssetStats,
  CreateAssetDto,
  CreateInspectionDto,
  UpdateAssetStatusDto,
} from "../dto";

const INSPECTION_CYCLE_DAYS = 90;

const ASSET_STATUSES: AssetStatus[] = [
  AssetStatus.ACTIVE,
  AssetStatus.OPERATIONAL,
  AssetStatus.MAINTENANCE,
  AssetStatus.UNDER_MAINTENANCE,
  AssetStatus.DAMAGED,
  AssetStatus.INACTIVE,
  AssetStatus.RETIRED,
  AssetStatus.OUT_OF_SERVICE,
];

const ASSET_CATEGORIES: AssetCategory[] = [
  AssetCategory.ROAD,
  AssetCategory.WATER,
  AssetCategory.ELECTRICITY,
  AssetCategory.STREET_LIGHT,
  AssetCategory.PARK,
  AssetCategory.BUILDING,
  AssetCategory.PUBLIC_TRANSPORT,
  AssetCategory.SANITATION,
  AssetCategory.OTHER,
];

const STAFF_ROLES: UserRole[] = [UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN];

function isAssetStatus(value: unknown): value is AssetStatus {
  return typeof value === "string" && (ASSET_STATUSES as string[]).includes(value);
}

function isAssetCategory(value: unknown): value is AssetCategory {
  return typeof value === "string" && (ASSET_CATEGORIES as string[]).includes(value);
}

function emptyStatusCount(): Record<AssetStatus, number> {
  return {
    [AssetStatus.ACTIVE]: 0,
    [AssetStatus.OPERATIONAL]: 0,
    [AssetStatus.MAINTENANCE]: 0,
    [AssetStatus.UNDER_MAINTENANCE]: 0,
    [AssetStatus.DAMAGED]: 0,
    [AssetStatus.INACTIVE]: 0,
    [AssetStatus.RETIRED]: 0,
    [AssetStatus.OUT_OF_SERVICE]: 0,
  };
}

function emptyCategoryCount(): Record<AssetCategory, number> {
  return {
    [AssetCategory.ROAD]: 0,
    [AssetCategory.WATER]: 0,
    [AssetCategory.ELECTRICITY]: 0,
    [AssetCategory.STREET_LIGHT]: 0,
    [AssetCategory.PARK]: 0,
    [AssetCategory.BUILDING]: 0,
    [AssetCategory.PUBLIC_TRANSPORT]: 0,
    [AssetCategory.SANITATION]: 0,
    [AssetCategory.OTHER]: 0,
  };
}

function assertCanManageAsset(actor: Actor): void {
  if ((STAFF_ROLES as UserRole[]).includes(actor.role)) return;
  throw new ForbiddenError("Only staff can manage city assets");
}

export const assetService = {
  async list(query: AssetQuery = {}): Promise<{ items: StoredAsset[]; pagination: Pagination }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    if (query.category !== undefined && !isAssetCategory(query.category)) {
      throw new AppError(`Invalid category. Allowed: ${ASSET_CATEGORIES.join(", ")}`, 422);
    }
    if (query.status !== undefined && !isAssetStatus(query.status)) {
      throw new AppError(`Invalid status. Allowed: ${ASSET_STATUSES.join(", ")}`, 422);
    }
    const q = (query.search ?? "").trim().toLowerCase();
    const items = assetRepository.assets.query({
      searchFields: ["name", "address", "department", "maintainedBy"],
      search: q || undefined,
      filter: (a) =>
        (query.category === undefined || a.category === query.category) &&
        (query.status === undefined || a.status === query.status),
      sort: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    });
    const { items: paged, pagination } = paginate(items, page, limit);
    return { items: paged, pagination };
  },

  async getById(id: string): Promise<StoredAsset> {
    const asset = assetRepository.assets.findById(id);
    if (!asset) throw new NotFoundError("Asset not found");
    return asset;
  },

  async create(actor: Actor, dto: CreateAssetDto): Promise<StoredAsset> {
    assertCanManageAsset(actor);
    if (!dto.name || !dto.name.trim()) throw new ValidationError({ name: "name is required" });
    if (!dto.department || !dto.department.trim()) {
      throw new ValidationError({ department: "department is required" });
    }
    const category = dto.category ?? AssetCategory.OTHER;
    if (!isAssetCategory(category)) {
      throw new AppError(`Invalid category. Allowed: ${ASSET_CATEGORIES.join(", ")}`, 422);
    }
    const status = dto.status ?? AssetStatus.OPERATIONAL;
    if (!isAssetStatus(status)) {
      throw new AppError(`Invalid status. Allowed: ${ASSET_STATUSES.join(", ")}`, 422);
    }

    const now = new Date().toISOString();
    return assetRepository.assets.create({
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
    } as unknown as StoredAsset);
  },

  async updateStatus(id: string, actor: Actor, dto: UpdateAssetStatusDto): Promise<StoredAsset> {
    await this.getById(id);
    assertCanManageAsset(actor);
    if (!isAssetStatus(dto.status)) {
      throw new AppError(`Invalid status. Allowed: ${ASSET_STATUSES.join(", ")}`, 422);
    }
    const updated = assetRepository.assets.update(id, {
      status: dto.status,
      lastStatusNote: dto.note?.trim() || null,
      updatedBy: actor.id,
      updatedAt: new Date().toISOString(),
    } as Partial<StoredAsset>);
    if (!updated) throw new NotFoundError("Asset not found");
    return updated;
  },

  async remove(id: string, actor: Actor): Promise<void> {
    const asset = await this.getById(id);
    assertCanManageAsset(actor);
    assetRepository.assets.delete(id);
    assetRepository.inspections
      .all()
      .filter((i) => i.assetId === id)
      .forEach((i) => assetRepository.inspections.delete(i.id));
  },

  async listInspections(assetId: string): Promise<StoredAssetInspection[]> {
    return assetRepository.inspections
      .all()
      .filter((i) => i.assetId === assetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createInspection(assetId: string, actor: Actor, dto: CreateInspectionDto): Promise<StoredAssetInspection> {
    const asset = await this.getById(assetId);
    assertCanManageAsset(actor);
    if (!dto.status || !dto.status.trim()) throw new ValidationError({ status: "status is required" });
    if (!dto.findings || !dto.findings.trim()) throw new ValidationError({ findings: "findings is required" });

    const now = new Date();
    const inspection = assetRepository.inspections.create({
      assetId,
      inspectorId: actor.id,
      status: dto.status.trim(),
      findings: dto.findings.trim(),
      inspectedBy: actor.email,
      createdAt: now.toISOString(),
    } as unknown as StoredAssetInspection);

    assetRepository.assets.update(assetId, {
      lastInspectionAt: now.toISOString(),
      nextInspectionAt: new Date(now.getTime() + INSPECTION_CYCLE_DAYS * 86_400_000).toISOString(),
      updatedBy: actor.id,
      updatedAt: now.toISOString(),
    } as Partial<StoredAsset>);

    return inspection;
  },

  async latestInspection(assetId: string): Promise<StoredAssetInspection | null> {
    const inspections = await this.listInspections(assetId);
    return inspections[0] ?? null;
  },

  async stats(): Promise<AssetStats> {
    const assets = assetRepository.assets.all();
    const byStatus = emptyStatusCount();
    const byCategory = emptyCategoryCount();
    for (const a of assets) {
      byStatus[a.status] += 1;
      byCategory[a.category] += 1;
    }
    return { total: assets.length, byStatus, byCategory };
  },
};

export default assetService;