type ExpressApp = (req: unknown, res: unknown) => Promise<unknown>;

let bootPromise: Promise<ExpressApp> | null = null;

/**
 * Boots the SmartCity OS Express monolith once per serverless instance and
 * returns it for delegation from the Next.js `/api/v1/*` handler.
 *
 * Database strategy:
 * - MongoDB reachable (set `MONGODB_URL` on Vercel → Atlas): reference data and
 *   demo accounts are provisioned idempotently, then caches hydrate from Mongo.
 * - MongoDB unreachable: the in-memory demo seed fills the repositories so the
 *   whole demo (login, dashboards, GIS) still works.
 */
export async function getOrBootMonolith(): Promise<ExpressApp> {
  if (!bootPromise) {
    bootPromise = (async () => {
      const [{ createApp }, { connectMongo }, { bootstrapDatabase }, { attachAllRepositories }] =
        await Promise.all([
          import("../../../backend/src/loaders"),
          import("../../../backend/src/core/database/mongo"),
          import("../../../backend/src/core/seed/bootstrap"),
          import("../../../backend/src/core/database/repository"),
        ]);

      const app = await createApp();

      const connected = await connectMongo();
      if (connected) {
        await bootstrapDatabase();

        // Provision the operational demo dataset (complaints, assets, emergencies…)
        // once — idempotent, only inserts into empty collections.
        const { seedDatabase } = await import("../../../backend/src/seed-cli");
        await seedDatabase();
      } else {
        const { seedInMemoryDemo } = await import("../../../backend/src/core/seed/demo-in-memory");
        seedInMemoryDemo();
      }

      await attachAllRepositories();
      return app as ExpressApp;
    })().catch((err) => {
      bootPromise = null; // allow retry on the next request
      throw err;
    });
  }
  return bootPromise;
}