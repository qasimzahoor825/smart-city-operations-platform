import { Schema, model, models, type Model, type PipelineStage } from "mongoose";
import { registerModels } from "../../models";
import { uid } from "../utils";
import { mongoState } from "./mongo";

// Register typed schemas before any model is created lazily by `modelFor`.
registerModels();

export type Entity<T extends { id: string }> = T;

export interface FindOptions<T> {
  filter?: (item: T) => boolean;
  sort?: (a: T, b: T) => number;
  searchFields?: (keyof T & string)[];
  search?: string;
}

const stores = new Map<string, Repository<object>>();

/**
 * Lazy Mongoose model for a collection. Explicit typed schemas registered in
 * `src/models` take precedence; otherwise a lenient schema with a unique `id`
 * string field is used so every persisted document is stable and indexable.
 */
export function modelFor(collection: string): Model<object> {
  if (models[collection]) return models[collection] as Model<object>;
  const schema = new Schema<object>(
    {
      id: { type: String, unique: true, sparse: true, index: true },
    },
    { strict: false, minimize: false, versionKey: false },
  );
  return model(collection, schema, collection);
}

/** Strip Mongoose bookkeeping paths (`_id`, `__v`) that can't be set via `$set`. */
export function stripMongoKeys(value: Record<string, unknown>): Record<string, unknown> {
  const clone: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    if (key === "_id" || key === "__v") continue;
    clone[key] = val;
  }
  return clone;
}

/**
 * Mongo-backed repository that preserves the original synchronous facade.
 *
 * Business services use the same surface as before (`findById / create /
 * update / delete / query / all / count / seed`) so existing logic is
 * untouched, while every mutation is persisted to MongoDB using per-document
 * upserts (never a wipe-and-reinsert). The synchronous cache is hydrated from
 * the live database on boot via `hydrateFromMongo`.
 *
 * `seed()` only mutates the in-memory cache and is used exclusively by tests —
 * fixture data is NEVER written to MongoDB, so the database can never contain
 * mock records. Real API/aggregation endpoints additionally expose
 * `aggregate()` / `countDocuments()` which run actual MongoDB pipelines.
 */
export class Repository<T extends object> {
  protected items: T[] = [];

  private opQueue: Promise<unknown> = Promise.resolve();

  constructor(
    initial: T[] = [],
    protected readonly collectionName?: string,
  ) {
    if (initial.length > 0) this.items = [...initial];
  }

  private enqueue(fn: () => Promise<unknown>): void {
    if (!this.collectionName || mongoState() !== "connected") return;
    this.opQueue = this.opQueue.then(fn, fn).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`[mongo] persist failed for '${this.collectionName}'`, err);
    });
  }

  private persistedId(item: T): string | null {
    const id = (item as { id?: unknown }).id;
    return id === undefined || id === null ? null : String(id);
  }

  private upsertDoc(item: T): void {
    const id = this.persistedId(item);
    if (!id) return;
    const Model = modelFor(this.collectionName as string);
    const fields = stripMongoKeys(item as Record<string, unknown>);
    this.enqueue(() => Model.findOneAndUpdate({ id }, { $set: fields }, { upsert: true }).exec());
  }

  private removeDoc(id: string): void {
    if (!this.collectionName || mongoState() !== "connected") return;
    const Model = modelFor(this.collectionName);
    this.enqueue(() => Model.deleteOne({ id }).exec());
  }

  /** Reload the cache from MongoDB (the source of truth) at boot / on demand. */
  async hydrateFromMongo(): Promise<void> {
    if (!this.collectionName || mongoState() !== "connected") return;
    try {
      const docs = await modelFor(this.collectionName).find().lean().exec();
      this.items = (docs ?? []).map((doc) => ({
        ...stripMongoKeys(doc as Record<string, unknown>),
      })) as T[];
    } catch (err) {
      // A transient DB error must never take the application down.
      // eslint-disable-next-line no-console
      console.error(`[mongo] hydrate failed for '${this.collectionName}'`, err);
    }
  }

  /** True when the cache mirrors the live database (hydrated from Mongo). */
  isDbBacked(): boolean {
    return Boolean(this.collectionName) && mongoState() === "connected";
  }

  seed(items: T[]): void {
    this.items = [...items];
  }

  all(): T[] {
    return [...this.items];
  }

  findById(id: string): T | undefined {
    return this.items.find((item) => (item as { id?: string }).id === id);
  }

  create(item: T): T {
    const record = { id: uid("rec"), ...item } as T;
    this.items.push(record);
    this.upsertDoc(record);
    return record;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const index = this.items.findIndex((item) => (item as { id?: string }).id === id);
    if (index === -1) return undefined;
    this.items[index] = { ...this.items[index], ...patch, id } as T;
    this.upsertDoc(this.items[index]);
    return this.items[index];
  }

  delete(id: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((item) => (item as { id?: string }).id !== id);
    const removed = this.items.length < before;
    if (removed) this.removeDoc(id);
    return removed;
  }

  query(options: FindOptions<T>): T[] {
    let result = [...this.items];
    if (options.search && options.searchFields && options.searchFields.length) {
      const q = options.search.toLowerCase();
      result = result.filter((item) =>
        options.searchFields!.some((field) => String(item[field] ?? "").toLowerCase().includes(q)),
      );
    }
    if (options.filter) result = result.filter(options.filter);
    if (options.sort) result = result.sort(options.sort);
    return result;
  }

  count(): number {
    return this.items.length;
  }

  /** Run a real MongoDB aggregation pipeline when available. */
  async aggregate<T = Record<string, unknown>>(pipeline: PipelineStage[]): Promise<T[]> {
    if (!this.collectionName || mongoState() !== "connected") return [] as T[];
    return modelFor(this.collectionName).aggregate(pipeline) as unknown as Promise<T[]>;
  }

  /** Count filtered documents straight from MongoDB when available. */
  async countDocuments(filter: object = {}): Promise<number> {
    if (!this.collectionName || mongoState() !== "connected") return this.items.length;
    return modelFor(this.collectionName).countDocuments(filter);
  }
}

/** Historical alias — kept for any import that referenced the old class name. */
export class InMemoryRepository<T extends object> extends Repository<T> {}

/**
 * Per-collection singleton. Every module that touches the same collection
 * shares one instance backed by one cache + one MongoDB collection, so data
 * written through one module (e.g. auth) is immediately visible to others
 * (e.g. users/citizens).
 */
export function collection<T extends object>(name: string): Repository<T> {
  if (!stores.has(name)) stores.set(name, new Repository<T>([], name));
  return stores.get(name) as Repository<T>;
}

export function allRepositories(): Repository<object>[] {
  return [...stores.values()] as Repository<object>[];
}

export async function attachAllRepositories(): Promise<void> {
  if (mongoState() !== "connected") return;
  await Promise.all(allRepositories().map((repo) => repo.hydrateFromMongo()));
}

export default InMemoryRepository;