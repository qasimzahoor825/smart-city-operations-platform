"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queues = void 0;
const handlers = new Map();
let queue = [];
exports.queues = {
    register(name, handler) {
        if (handlers.has(name))
            return;
        handlers.set(name, handler);
    },
    async enqueue(name, payload, options) {
        const job = {
            id: `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
            name,
            payload,
            status: "queued",
            attempts: 0,
            maxAttempts: options?.maxAttempts ?? 3,
            enqueuedAt: new Date().toISOString(),
        };
        queue = [job, ...queue];
        if (handlers.has(name))
            void processJob(job);
        return job;
    },
    list() {
        return [...queue];
    },
    async drain() {
        const pending = queue.filter((j) => j.status === "queued");
        for (const job of pending) {
            await processJob(job);
        }
    },
};
async function processJob(job) {
    const handler = handlers.get(job.name);
    if (!handler)
        return;
    job.status = "processing";
    job.attempts += 1;
    try {
        await handler(job.payload);
        job.status = "completed";
        job.processedAt = new Date().toISOString();
    }
    catch (err) {
        job.status = "failed";
        job.error = err instanceof Error ? err.message : String(err);
        if (job.attempts < job.maxAttempts) {
            queue = [...queue.filter((j) => j.id !== job.id), job];
            setTimeout(() => processJob(job), 100);
        }
    }
}
exports.default = exports.queues;
//# sourceMappingURL=index.js.map