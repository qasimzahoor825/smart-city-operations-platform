"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSocket = attachSocket;
exports.getSocket = getSocket;
exports.emitToRoom = emitToRoom;
exports.emitToUser = emitToUser;
exports.emitToStaff = emitToStaff;
exports.emitToDepartment = emitToDepartment;
exports.broadcast = broadcast;
exports.onRoomEvent = onRoomEvent;
exports.createHttpServerWithSocket = createHttpServerWithSocket;
const node_events_1 = require("node:events");
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const jwt_1 = require("../../lib/jwt/jwt");
const common_1 = require("@smartcity/common");
const roomBus = new node_events_1.EventEmitter();
let server = null;
const STAFF_ROLES = [common_1.UserRole.OFFICER, common_1.UserRole.DEPARTMENT_HEAD, common_1.UserRole.SUPER_ADMIN];
function claimsFor(socket) {
    const data = (socket.data ?? {});
    return data.auth ?? null;
}
/** Rooms a client is actually allowed to join — enforced server-side. */
function allowedRooms(socket) {
    const auth = claimsFor(socket);
    if (!auth)
        return [];
    const rooms = [`user:${auth.sub}`];
    if (STAFF_ROLES.includes(auth.role))
        rooms.push("staff");
    if (auth.departmentId)
        rooms.push(`department:${auth.departmentId}`);
    return rooms;
}
function attachSocket(httpServer) {
    if (server)
        return server;
    server = new socket_io_1.Server(httpServer, {
        cors: { origin: "*", credentials: true },
    });
    server.use((socket, next) => {
        const initial = socket.handshake.auth;
        const query = socket.handshake.query;
        const token = initial?.token ?? query?.token ?? "";
        if (!token)
            return next(new Error("unauthorized"));
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(String(token));
            socket.data.auth = {
                ...decoded,
                role: decoded.role,
                departmentId: decoded.departmentId ?? null,
            };
            next();
        }
        catch {
            next(new Error("unauthorized"));
        }
    });
    server.on("connection", (socket) => {
        const rooms = allowedRooms(socket);
        rooms.forEach((room) => socket.join(room));
        socket.on("join:room", (roomId) => {
            const target = String(roomId ?? "");
            if (allowedRooms(socket).includes(target))
                socket.join(target);
        });
        socket.on("leave:room", (roomId) => socket.leave(String(roomId)));
    });
    return server;
}
function getSocket() {
    return server;
}
function emitToRoom(room, event, payload) {
    if (server)
        server.to(room).emit(event, payload);
    roomBus.emit(event, payload);
}
function emitToUser(userId, event, payload) {
    emitToRoom(`user:${userId}`, event, payload);
}
function emitToStaff(event, payload) {
    if (server)
        server.to("staff").emit(event, payload);
    roomBus.emit(event, payload);
}
function emitToDepartment(departmentId, event, payload) {
    if (departmentId)
        emitToRoom(`department:${departmentId}`, event, payload);
}
function broadcast(event, payload) {
    if (server)
        server.emit(event, payload);
    roomBus.emit(event, payload);
}
function onRoomEvent(event, cb) {
    const handler = (p) => cb(p);
    roomBus.on(event, handler);
    return () => roomBus.off(event, handler);
}
function createHttpServerWithSocket(app) {
    const httpServer = (0, node_http_1.createServer)(app);
    attachSocket(httpServer);
    return httpServer;
}
exports.default = {
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
//# sourceMappingURL=index.js.map