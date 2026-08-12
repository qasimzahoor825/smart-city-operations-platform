import type { NextApiRequest, NextApiResponse } from "next";
import { getOrBootMonolith } from "../../../lib/server/monolith";

export const config = {
  // Let Express's body-parser read the raw request stream; Next would otherwise
  // consume it and break express.json().
  api: { bodyParser: false },
  runtime: "nodejs",
  maxDuration: 60,
};

/**
 * Serves the Express monolith from Vercel serverless functions.
 *
 * Next.js Pages-API routes receive native Node `req`/`res`, so we can hand the
 * request straight to the Express app — same middleware (cors, json, morgan,
 * rate-limit), auth and routes as the standalone monolith, without a long-running
 * process. `/api/v1/*` → Express (which mounts routes under the same prefix).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const app = await getOrBootMonolith();
    await app(req, res);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/v1] monolith delegate failed", err);
    if (!res.writableEnded) {
      res.status(500).json({ error: "SmartCity OS API is warming up — retry in a moment." });
    }
  }
}