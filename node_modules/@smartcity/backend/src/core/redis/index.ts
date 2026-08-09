import { EventEmitter } from "node:events";
import Redis from "ioredis";
import { config } from "../../config";
import { logger } from "../logger";

type Channel = "cache" | "queue" | "default";

/**
 * Redis-backed cache with an in-memory fallback.
 *
 * When the configured `REDIS_URL` is reachable, commands are proxied to a real
 * Redis instance (scales horizontally, shared across instances). Otherwise the
 * implementation degrades gracefully to an in-process EventEmitter + Map so
 * every feature keeps working in development without extra infrastructure.
 * `isRedisConnected()` lets callers decide whether heavy jobs should run.
 */

const memoryChannels = new Map<Channel, EventEmitter>();
let client: Redis | null = null;
let subscriber: Redis | null = null;
let connected = false;
let triedConnect = false;

function memoryChannel(name: Channel): EventEmitter {
  if (!memoryChannels.has(name)) {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(200);
    memoryChannels.set(name, emitter);
  }
  return memoryChannels.get(name)!;
}

function tryConnect(): void {
  if (triedConnect) return;
  triedConnect = true;
  try {
    client = new Redis(config.redisUrl, {
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
  } catch {
    connected = false;
  }
}

export function isRedisConnected(): boolean {
  return connected && client !== null;
}

export const redis = {
  async get(key: string): Promise<string | null> {
    tryConnect();
    if (isRedisConnected()) {
      try {
        return await client!.get(key);
      } catch {
        connected = false;
      }
    }
    const holder = memoryChannel("cache") as { __data?: Map<string, string> };
    return holder.__data?.get(key) ?? null;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    tryConnect();
    if (isRedisConnected()) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await client!.set(key, value, "EX", ttlSeconds);
        } else {
          await client!.set(key, value);
        }
        return;
      } catch {
        connected = false;
      }
    }
    const holder = memoryChannel("cache") as { __data?: Map<string, string> };
    if (!holder.__data) holder.__data = new Map();
    holder.__data.set(key, value);
    if (ttlSeconds && ttlSeconds > 0) {
      setTimeout(() => redis.del(key).catch(() => undefined), ttlSeconds * 1000).unref();
    }
  },

  async del(key: string): Promise<void> {
    tryConnect();
    if (isRedisConnected()) {
      try {
        await client!.del(key);
        return;
      } catch {
        connected = false;
      }
    }
    (memoryChannel("cache") as { __data?: Map<string, string> }).__data?.delete(key);
  },

  async publish(topic: string, message: string): Promise<number> {
    tryConnect();
    if (isRedisConnected()) {
      try {
        return await client!.publish(topic, message);
      } catch {
        connected = false;
      }
    }
    memoryChannel("default").emit(topic, message);
    return 1;
  },

  subscribe(topic: string, cb: (message: string) => void): () => void {
    tryConnect();
    if (isRedisConnected() && subscriber) {
      const sub = subscriber;
      let unsubscribe: () => void = () => undefined;
      try {
        void sub.subscribe(topic).then(() => {
          sub.on("message", (channel, message) => {
            if (channel === topic) cb(message);
          });
        });
        unsubscribe = () => void sub.unsubscribe(topic);
      } catch {
        connected = false;
      }
      return unsubscribe;
    }
    const handler = (msg: string) => cb(msg);
    memoryChannel("default").on(topic, handler);
    return () => memoryChannel("default").off(topic, handler);
  },

  async ping(): Promise<boolean> {
    tryConnect();
    if (isRedisConnected()) {
      try {
        return (await client!.ping()) === "PONG";
      } catch {
        connected = false;
      }
    }
    return true;
  },
};

export default redis;