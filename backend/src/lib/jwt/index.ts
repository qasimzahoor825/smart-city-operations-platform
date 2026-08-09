import jwt from "jsonwebtoken";
import { config } from "../../config";
import { UnauthorizedError } from "../../core/errors";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  departmentId?: string | null;
  [key: string]: unknown;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessTtl } as jwt.SignOptions);
}

export function signRefreshToken(subject: string): string {
  return jwt.sign({ sub: subject }, config.jwt.refreshSecret, {
    expiresIn: `${config.jwt.refreshTtlDays}d`,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (typeof decoded === "string") throw new Error("invalid token");
    return decoded as JwtPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): { sub: string } {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    if (typeof decoded === "string") throw new Error("invalid token");
    return { sub: String(decoded.sub) };
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

export default { signAccessToken, signRefreshToken: signRefreshToken, verifyAccessToken, verifyRefreshToken };