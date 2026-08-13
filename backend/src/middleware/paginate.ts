import type { Request, Response } from "express";

export function paginationQuery(req: Request): { page: number; limit: number } {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit };
}

export function paginatedResponse<T>(
  res: Response,
  items: T[],
  { page, limit }: { page: number; limit: number },
  message = "Success",
): void {
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  res.json({
    success: true,
    message,
    data: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages },
    timestamp: new Date().toISOString(),
  });
}