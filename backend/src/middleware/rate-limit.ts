import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors";

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Try again later." },
});

export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 150,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

/** Joi/zod-style validation helper used by route validators. */
export function validate(checks: Array<() => void>): (req: Request, _res: Response, next: NextFunction) => void {
  return (_req: Request, _res: Response, next: NextFunction) => {
    try {
      checks.forEach((check) => check());
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireBody(...fields: string[]): (req: Request, _res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction) => {
    const missing = fields.filter((f) => req.body?.[f] === undefined || req.body[f] === null || req.body[f] === "");
    if (missing.length > 0) {
      throw new AppError(`Missing required field(s): ${missing.join(", ")}`, 422);
    }
    next();
  };
}

export default { apiLimiter, authLimiter, requireBody, validate: requireBody };