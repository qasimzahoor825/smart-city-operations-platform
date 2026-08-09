export {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@smartcity/common";

import type { Request, Response, NextFunction } from "express";
import { AppError } from "@smartcity/common";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: "Resource not found", timestamp: new Date().toISOString() });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  console.error("[Monolith] unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error", timestamp: new Date().toISOString() });
}
