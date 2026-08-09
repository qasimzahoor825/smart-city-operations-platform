"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const store = new Map();
const now = () => Date.now();
exports.cache = {
    get(key) {
        const entry = store.get(key);
        if (!entry)
            return undefined;
        if (entry.expiresAt !== null && entry.expiresAt <= now()) {
            store.delete(key);
            return undefined;
        }
        return entry.value;
    },
    set(key, value, ttlMs = 60_000) {
        store.set(key, { value, expiresAt: now() + ttlMs });
    },
    del(key) {
        store.delete(key);
    },
    has(key) {
        return this.get(key) !== undefined;
    },
    clear() {
        store.clear();
    },
    delPattern(prefix) {
        for (const key of store.keys()) {
            if (key.startsWith(prefix))
                store.delete(key);
        }
    },
    stats() {
        for (const [key, entry] of store.entries()) {
            if (entry.expiresAt !== null && entry.expiresAt <= now())
                store.delete(key);
        }
        return { keys: [...store.keys()], size: store.size };
    },
};
exports.default = exports.cache;
//# sourceMappingURL=index.js.map