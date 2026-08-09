"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.isRedisConnected = isRedisConnected;
const node_events_1 = require("node:events");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../../config");
/**
 * Redis-backed cache with an in-memory fallback.
 *
 * When the configured `REDIS_URL` is reachable, commands are proxied to a real
 * Redis instance (scales horizontally, shared across instances). Otherwise the
 * implementation degrades gracefully to an in-process EventEmitter + Map so
 * every feature keeps working in development without extra infrastructure.
 * `isRedisConnected()` lets callers decide whether heavy jobs should run.
 */
const memoryChannels = new Map();
let client = null;
let subscriber = null;
let connected = false;
let triedConnect = false;
function memoryChannel(name) {
    if (!memoryChannels.has(name)) {
        const emitter = new node_events_1.EventEmitter();
        emitter.setMaxListeners(200);
        memoryChannels.set(name, emitter);
    }
    return memoryChannels.get(name);
}
function tryConnect() {
    if (triedConnect)
        return;
    triedConnect = true;
    try {
        client = new ioredis_1.default(config_1.config.redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            connectTimeout: 2_000,
            retryStrategy: () => null,
        });
        subscriber = client.duplicate();
        connected = true;
        // Failures (e.g. Redis not running) mark the backend as disconnected and
        // all calls fall back to the in-memory store — never throw to callers.
        client.on("error", () => {
            connected = false;
        });
        subscriber.on("error", () => {
            connected = false;
        });
    }
    catch {
        connected = false;
    }
}
function isRedisConnected() {
    return connected && client !== null;
}
exports.redis = {
    async get(key) {
        tryConnect();
        if (isRedisConnected()) {
            try {
                return await client.get(key);
            }
            catch {
                connected = false;
            }
        }
        const holder = memoryChannel("cache");
        return holder.__data?.get(key) ?? null;
    },
    async set(key, value, ttlSeconds) {
        tryConnect();
        if (isRedisConnected()) {
            try {
                if (ttlSeconds && ttlSeconds > 0) {
                    await client.set(key, value, "EX", ttlSeconds);
                }
                else {
                    await client.set(key, value);
                }
                return;
            }
            catch {
                connected = false;
            }
        }
        const holder = memoryChannel("cache");
        if (!holder.__data)
            holder.__data = new Map();
        holder.__data.set(key, value);
        if (ttlSeconds && ttlSeconds > 0) {
            setTimeout(() => exports.redis.del(key).catch(() => undefined), ttlSeconds * 1000).unref();
        }
    },
    async del(key) {
        tryConnect();
        if (isRedisConnected()) {
            try {
                await client.del(key);
                return;
            }
            catch {
                connected = false;
            }
        }
        memoryChannel("cache").__data?.delete(key);
    },
    async publish(topic, message) {
        tryConnect();
        if (isRedisConnected()) {
            try {
                return await client.publish(topic, message);
            }
            catch {
                connected = false;
            }
        }
        memoryChannel("default").emit(topic, message);
        return 1;
    },
    subscribe(topic, cb) {
        tryConnect();
        if (isRedisConnected() && subscriber) {
            const sub = subscriber;
            let unsubscribe = () => undefined;
            try {
                void sub.subscribe(topic).then(() => {
                    sub.on("message", (channel, message) => {
                        if (channel === topic)
                            cb(message);
                    });
                });
                unsubscribe = () => void sub.unsubscribe(topic);
            }
            catch {
                connected = false;
            }
            return unsubscribe;
        }
        const handler = (msg) => cb(msg);
        memoryChannel("default").on(topic, handler);
        return () => memoryChannel("default").off(topic, handler);
    },
    async ping() {
        tryConnect();
        if (isRedisConnected()) {
            try {
                return (await client.ping()) === "PONG";
            }
            catch {
                connected = false;
            }
        }
        return true;
    },
};
exports.default = exports.redis;
//# sourceMappingURL=index.js.map