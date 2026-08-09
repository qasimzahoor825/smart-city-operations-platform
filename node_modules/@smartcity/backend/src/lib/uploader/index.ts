import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";
import type { IncomingMessage } from "node:http";

function resolveUploadDir(): string {
  return path.resolve(process.cwd(), "uploads");
}

mkdirSync(resolveUploadDir(), { recursive: true });

export interface UploadedFile {
  filename: string;
  path: string;
  size: number;
  contentType?: string;
}

export const UPLOAD_DIR = resolveUploadDir();

/**
 * Dependency-free single-file upload middleware. Expects a raw request body
 * with an optional `X-Filename` header. Persists the payload under /uploads
 * and attaches `req.uploadedFile`. Calls next() with an error when no body.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      uploadedFile?: UploadedFile;
    }
  }
}

export function uploadSingle(field = "file"): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction) => {
    const filename = sanitize(req.headers["x-filename"] as string | undefined) || `${field}-${Date.now().toString(36)}`;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      if (body.length === 0) {
        next(new Error("No file payload received"));
        return;
      }
      const absPath = path.join(UPLOAD_DIR, filename);
      writeFileSync(absPath, body);
      req.uploadedFile = {
        filename,
        path: absPath,
        size: body.length,
        contentType: req.headers["content-type"],
      };
      next();
    });
    req.on("error", next);
  };
}

function sanitize(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export const uploader = { single: uploadSingle, dir: UPLOAD_DIR };

export default uploader;