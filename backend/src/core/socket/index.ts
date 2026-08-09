import { EventEmitter } from "node:events";
import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { Server as HttpServer, RequestListener } from "node:http";
import { verifyAccessToken, type JwtClaims } from "../../lib/jwt/jwt";
import { UserRole } from "@smartcity/common";

const roomBus = new EventEmitter();
let server: Server | null = null;

export interface SocketAuthClaims extends JwtClaims {
  role: UserRole;
  departmentId?: string | null;
}

const STAFF_ROLES = [UserRole.OFFICER, UserRole.DEPARTMENT_HEAD, UserRole.SUPER_ADMIN];

function claimsFor(socket: Socket): SocketAuthClaims | null {
  const data = (socket.data ?? {}) as { auth?: SocketAuthClaims };
  return data.auth ?? null;
}

/** Rooms a client is actually allowed to join — enforced server-side. */
function allowedRooms(socket: Socket): string[] {
  const auth = claimsFor(socket);
  if (!auth) return [];
  const rooms = [`user:${auth.sub}`];
  if (STAFF_ROLES.includes(auth.role)) rooms.push("staff");
  if (auth.departmentId) rooms.push(`department:${auth.departmentId}`);
  return rooms;
}

export function attachSocket(httpServer: HttpServer): Server {
  if (server) return server;
  server = new Server(httpServer, {
    cors: { origin: "*", credentials: true },
  });

  server.use((socket, next) => {
    const initial = (socket.handshake as { auth?: { token?: string }; query?: { token?: string } }).auth;
    const query = socket.handshake.query as { token?: string };
    const token = initial?.token ?? query?.token ?? "";
    if (!token) return next(new Error("unauthorized"));
    try {
      const decoded = verifyAccessToken(String(token));
      socket.data.auth = {
        ...decoded,
        role: decoded.role as UserRole,
        departmentId: decoded.departmentId ?? null,
      };
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  server.on("connection", (socket) => {
    const rooms = allowedRooms(socket);
    rooms.forEach((room) => socket.join(room));

    socket.on("join:room", (roomId: string) => {
      const target = String(roomId ?? "");
      if (allowedRooms(socket).includes(target)) socket.join(target);
    });
    socket.on("leave:room", (roomId: string) => socket.leave(String(roomId)));
  });

  return server;
}

export function getSocket(): Server | null {
  return server;
}

export function emitToRoom<T>(room: string, event: string, payload: T): void {
  if (server) server.to(room).emit(event, payload);
  roomBus.emit(event, payload);
}

export function emitToUser<T>(userId: string, event: string, payload: T): void {
  emitToRoom(`user:${userId}`, event, payload);
}

export function emitToStaff<T>(event: string, payload: T): void {
  if (server) server.to("staff").emit(event, payload);
  roomBus.emit(event, payload);
}

export function emitToDepartment<T>(departmentId: string, event: string, payload: T): void {
  if (departmentId) emitToRoom(`department:${departmentId}`, event, payload);
}

export function broadcast<T>(event: string, payload: T): void {
  if (server) server.emit(event, payload);
  roomBus.emit(event, payload);
}

export function onRoomEvent<T>(event: string, cb: (payload: T) => void): () => void {
  const handler = (p: T) => cb(p);
  roomBus.on(event, handler);
  return () => roomBus.off(event, handler);
}

export function createHttpServerWithSocket(app: RequestListener): HttpServer {
  const httpServer = createServer(app);
  attachSocket(httpServer);
  return httpServer;
}

export default {
  attachSocket,
  broadcast,
  createHttpServerWithSocket,
  emitToDepartment,
  emitToRoom,
  emitToStaff,
  emitToUser,
  getSocket,
  onRoomEvent,
};