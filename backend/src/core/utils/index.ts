export {
  createApiResponse,
  createListResponse,
  generateRef,
  paginate,
  parsePagination,
  toRichText,
  uid,
} from "@smartcity/common";

export function asyncHandler<T = unknown>(
  fn: (req: import("express").Request, res: import("express").Response) => Promise<T>,
): (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void {
  return (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export function toSlug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function clampDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
