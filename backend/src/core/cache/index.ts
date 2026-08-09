interface CacheEntry {
  value: unknown;
  expiresAt: number | null;
}

const store = new Map<string, CacheEntry>();

const now = () => Date.now();

export const cache = {
  get<T>(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt !== null && entry.expiresAt <= now()) {
      store.delete(key);
      return undefined;
    }
    return entry.value as T;
  },

  set<T>(key: string, value: T, ttlMs = 60_000): void {
    store.set(key, { value, expiresAt: now() + ttlMs });
  },

  del(key: string): void {
    store.delete(key);
  },

  has(key: string): boolean {
    return this.get(key) !== undefined;
  },

  clear(): void {
    store.clear();
  },

  delPattern(prefix: string): void {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  },

  stats(): { size: number; keys: string[] } {
    for (const [key, entry] of store.entries()) {
      if (entry.expiresAt !== null && entry.expiresAt <= now()) store.delete(key);
    }
    return { keys: [...store.keys()], size: store.size };
  },
};

export default cache;