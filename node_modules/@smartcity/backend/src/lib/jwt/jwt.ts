import jwt from "jsonwebtoken";
import { config } from "../../config";

export interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  departmentId?: string | null;
}

export function signAccessToken(claims: JwtClaims): string {
  return jwt.sign(claims, config.jwt.secret, {
    expiresIn: config.jwt.accessTtl as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(sub: string): string {
  return jwt.sign({ sub }, config.jwt.refreshSecret, {
    expiresIn: `${config.jwt.refreshTtlDays}d` as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): JwtClaims {
  const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
  return {
    sub: String(decoded.sub),
    email: String(decoded.email ?? ""),
    role: String(decoded.role ?? ""),
    departmentId: (decoded.departmentId as string | null) ?? null,
  };
}

export function verifyRefreshToken(token: string): { sub: string } {
  const decoded = jwt.verify(token, config.jwt.refreshSecret) as jwt.JwtPayload;
  return { sub: String(decoded.sub) };
}

export function ttlSeconds(ttl: string): number {
  const m = /^(\d+)(m|h|d|s)$/.exec(ttl);
  if (!m) return 900;
  const n = Number(m[1]);
  switch (m[2]) {
    case "s":
      return n;
    case "m":
      return n * 60;
    case "h":
      return n * 3600;
    case "d":
      return n * 86_400;
    default:
      return 900;
  }
}