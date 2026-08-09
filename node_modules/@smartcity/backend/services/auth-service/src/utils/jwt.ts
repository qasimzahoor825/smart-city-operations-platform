import jwt from "jsonwebtoken";
import { config } from "../config";
import { UserRole } from "@smartcity/shared";

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}

export interface JwtRefreshPayload {
  sub: string;
  jti: string;
}

export interface VerifyResult {
  valid: boolean;
  payload?: JwtAccessPayload;
  error?: string;
}

export function signAccessToken(user: {
  id: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}): string {
  const payload: JwtAccessPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  };
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.accessTokenTtl as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(userId: string, sessionId: string): string {
  return jwt.sign({ sub: userId, jti: sessionId }, config.refreshSecret, {
    expiresIn: "30d",
  });
}

export function verifyAccessToken(token: string): VerifyResult {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtAccessPayload;
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}

export function verifyRefreshToken(token: string): VerifyResult {
  try {
    const payload = jwt.verify(token, config.refreshSecret) as JwtRefreshPayload;
    return { valid: true, payload: payload as unknown as JwtAccessPayload };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}