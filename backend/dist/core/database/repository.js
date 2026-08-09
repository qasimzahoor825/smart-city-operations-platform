"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRepository = exports.Repository = void 0;
exports.modelFor = modelFor;
exports.stripMongoKeys = stripMongoKeys;
exports.collection = collection;
exports.allRepositories = allRepositories;
exports.attachAllRepositories = attachAllRepositories;
const mongoose_1 = require("mongoose");
const models_1 = require("../../models");
const utils_1 = require("../utils");
const mongo_1 = require("./mongo");
// Register typed schemas before any model is created lazily by `modelFor`.
(0, models_1.registerModels)();
const stores = new Map();
/**
 * Lazy Mongoose model for a collection. Explicit typed schemas registered in
 * `src/models` take precedence; otherwise a lenient schema with a unique `id`
 * string field is used so every persisted document is stable and indexable.
 */
function modelFor(collection) {
    if (mongoose_1.models[collection])
        return mongoose_1.models[collection];
    const schema = new mongoose_1.Schema({
        id: { type: String, unique: true, sparse: true, index: true },
    }, { strict: false, minimize: false, versionKey: false });
    return (0, mongoose_1.model)(collection, schema, collection);
}
/** Strip Mongoose bookkeeping paths (`_id`, `__v`) that can't be set via `$set`. */
function stripMongoKeys(value) {
    const clone = {};
    for (const [key, val] of Object.entries(value)) {
        if (key === "_id" || key === "__v")
            continue;
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
class Repository {
    collectionName;
    items = [];
    opQueue = Promise.resolve();
    constructor(initial = [], collectionName) {
        this.collectionName = collectionName;
        if (initial.length > 0)
            this.items = [...initial];
    }
    enqueue(fn) {
        if (!this.collectionName || (0, mongo_1.mongoState)() !== "connected")
            return;
        this.opQueue = this.opQueue.then(fn, fn).catch((err) => {
            // eslint-disable-next-line no-console
            console.error(`[mongo] persist failed for '${this.collectionName}'`, err);
        });
    }
    persistedId(item) {
        const id = item.id;
        return id === undefined || id === null ? null : String(id);
    }
    upsertDoc(item) {
        const id = this.persistedId(item);
        if (!id)
            return;
        const Model = modelFor(this.collectionName);
        const fields = stripMongoKeys(item);
        this.enqueue(() => Model.findOneAndUpdate({ id }, { $set: fields }, { upsert: true }).exec());
    }
    removeDoc(id) {
        if (!this.collectionName || (0, mongo_1.mongoState)() !== "connected")
            return;
        const Model = modelFor(this.collectionName);
        this.enqueue(() => Model.deleteOne({ id }).exec());
    }
    /** Reload the cache from MongoDB (the source of truth) at boot / on demand. */
    async hydrateFromMongo() {
        if (!this.collectionName || (0, mongo_1.mongoState)() !== "connected")
            return;
        try {
            const docs = await modelFor(this.collectionName).find().lean().exec();
            this.items = (docs ?? []).map((doc) => ({
                ...stripMongoKeys(doc),
            }));
        }
        catch (err) {
            // A transient DB error must never take the application down.
            // eslint-disable-next-line no-console
            console.error(`[mongo] hydrate failed for '${this.collectionName}'`, err);
        }
    }
    /** True when the cache mirrors the live database (hydrated from Mongo). */
    isDbBacked() {
        return Boolean(this.collectionName) && (0, mongo_1.mongoState)() === "connected";
    }
    seed(items) {
        this.items = [...items];
    }
    all() {
        return [...this.items];
    }
    findById(id) {
        return this.items.find((item) => item.id === id);
    }
    create(item) {
        const record = { id: (0, utils_1.uid)("rec"), ...item };
        this.items.push(record);
        this.upsertDoc(record);
        return record;
    }
    update(id, patch) {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1)
            return undefined;
        this.items[index] = { ...this.items[index], ...patch, id };
        this.upsertDoc(this.items[index]);
        return this.items[index];
    }
    delete(id) {
        const before = this.items.length;
        this.items = this.items.filter((item) => item.id !== id);
        const removed = this.items.length < before;
        if (removed)
            this.removeDoc(id);
        return removed;
    }
    query(options) {
        let result = [...this.items];
        if (options.search && options.searchFields && options.searchFields.length) {
            const q = options.search.toLowerCase();
            result = result.filter((item) => options.searchFields.some((field) => String(item[field] ?? "").toLowerCase().includes(q)));
        }
        if (options.filter)
            result = result.filter(options.filter);
        if (options.sort)
            result = result.sort(options.sort);
        return result;
    }
    count() {
        return this.items.length;
    }
    /** Run a real MongoDB aggregation pipeline when available. */
    async aggregate(pipeline) {
        if (!this.collectionName || (0, mongo_1.mongoState)() !== "connected")
            return [];
        return modelFor(this.collectionName).aggregate(pipeline);
    }
    /** Count filtered documents straight from MongoDB when available. */
    async countDocuments(filter = {}) {
        if (!this.collectionName || (0, mongo_1.mongoState)() !== "connected")
            return this.items.length;
        return modelFor(this.collectionName).countDocuments(filter);
    }
}
exports.Repository = Repository;
/** Historical alias — kept for any import that referenced the old class name. */
class InMemoryRepository extends Repository {
}
exports.InMemoryRepository = InMemoryRepository;
/**
 * Per-collection singleton. Every module that touches the same collection
 * shares one instance backed by one cache + one MongoDB collection, so data
 * written through one module (e.g. auth) is immediately visible to others
 * (e.g. users/citizens).
 */
function collection(name) {
    if (!stores.has(name))
        stores.set(name, new Repository([], name));
    return stores.get(name);
}
function allRepositories() {
    return [...stores.values()];
}
async function attachAllRepositories() {
    if ((0, mongo_1.mongoState)() !== "connected")
        return;
    await Promise.all(allRepositories().map((repo) => repo.hydrateFromMongo()));
}
exports.default = InMemoryRepository;
//# sourceMappingURL=repository.js.map