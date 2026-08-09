import { AppError } from "@smartcity/common";
import { ZodObject, type ZodRawShape } from "zod";
import type { Request } from "express";

/** Validates req.body against a Zod schema; attaches `.parsedBody` for routes. */
export function validateBody<T extends ZodRawShape>(schema: ZodObject<T>) {
  return (req: Request, _res: unknown, next: (err?: unknown) => void): void => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors as Record<string, unknown>;
      throw new AppError("Validation failed", 422, errors);
    }
    (req as Request & { parsedBody: unknown }).parsedBody = result.data;
    next();
  };
}

export function validateParams<T extends ZodRawShape>(schema: ZodObject<T>) {
  return (req: Request, _res: unknown, next: (err?: unknown) => void): void => {
    const result = schema.safeParse(req.params ?? {});
    if (!result.success) {
      throw new AppError("Invalid path parameters", 422, result.error.flatten().fieldErrors as Record<string, unknown>);
    }
    next();
  };
}

export function validateQuery<T extends ZodRawShape>(schema: ZodObject<T>) {
  return (req: Request, _res: unknown, next: (err?: unknown) => void): void => {
    const result = schema.safeParse(req.query ?? {});
    if (!result.success) {
      throw new AppError("Invalid query parameters", 422, result.error.flatten().fieldErrors as Record<string, unknown>);
    }
    (req as Request & { parsedQuery: unknown }).parsedQuery = result.data;
    next();
  };
}

export function isEnumValue<T extends string>(value: unknown, enums: readonly T[] | Record<string, T>): boolean {
  const values = Array.isArray(enums) ? enums : Object.values(enums);
  return typeof value === "string" && (values as string[]).includes(value);
}

export function assertEnum<T extends string>(value: unknown, enums: readonly T[] | Record<string, T>, field = "value"): T {
  if (!isEnumValue(value, enums)) {
    const allowed = (Array.isArray(enums) ? enums : Object.values(enums)).join(", ");
    throw new AppError(`Invalid ${field}. Allowed: ${allowed}`, 422);
  }
  return value as T;
}