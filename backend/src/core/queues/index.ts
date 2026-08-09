export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface Job<T = unknown> {
  id: string;
  name: string;
  payload: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error?: string;
  enqueuedAt: string;
  processedAt?: string;
}

type JobHandler<T = unknown> = (payload: T) => void | Promise<void>;

const handlers = new Map<string, JobHandler>();
let queue: Job[] = [];

export const queues = {
  register<T>(name: string, handler: JobHandler<T>): void {
    if (handlers.has(name)) return;
    handlers.set(name, handler as JobHandler);
  },
  async enqueue<T>(name: string, payload: T, options?: { maxAttempts?: number }): Promise<Job<T>> {
    const job: Job<T> = {
      id: `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      name,
      payload,
      status: "queued",
      attempts: 0,
      maxAttempts: options?.maxAttempts ?? 3,
      enqueuedAt: new Date().toISOString(),
    };
    queue = [job as Job, ...queue];
    if (handlers.has(name)) void processJob(job as Job);
    return job;
  },
  list(): Job[] {
    return [...queue];
  },
  async drain(): Promise<void> {
    const pending = queue.filter((j) => j.status === "queued");
    for (const job of pending) {
      await processJob(job);
    }
  },
};

async function processJob(job: Job): Promise<void> {
  const handler = handlers.get(job.name);
  if (!handler) return;
  job.status = "processing";
  job.attempts += 1;
  try {
    await handler(job.payload);
    job.status = "completed";
    job.processedAt = new Date().toISOString();
  } catch (err) {
    job.status = "failed";
    job.error = err instanceof Error ? err.message : String(err);
    if (job.attempts < job.maxAttempts) {
      queue = [...queue.filter((j) => j.id !== job.id), job];
      setTimeout(() => processJob(job), 100);
    }
  }
}

export default queues;