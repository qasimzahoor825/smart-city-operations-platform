import mongoose from "mongoose";
import { config } from "../../config";
import { logger } from "../logger";

export type MongoState = "disconnected" | "connected" | "connecting" | "disconnecting";

export const MONGO_STATES: Record<number, MongoState> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
  99: "disconnected",
};

let cachedUrl: string | null = null;

function mongoUri(): string {
  if (cachedUrl) return cachedUrl;
  cachedUrl = config.database.mongoUrl;
  return cachedUrl;
}

export function mongoState(): MongoState {
  return MONGO_STATES[mongoose.connection.readyState] ?? "disconnected";
}

export async function connectMongo(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) return true;
  try {
    await mongoose.connect(mongoUri(), {
      serverSelectionTimeoutMS: 5_000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    logger.info(`MongoDB connected → ${mongoUri()}`);
    return true;
  } catch (err) {
    logger.warn("MongoDB unavailable — falling back to in-memory repositories", err);
    return false;
  }
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  }
}

export async function pingMongo(): Promise<boolean> {
  if (mongoose.connection.readyState !== 1) return false;
  try {
    await mongoose.connection.db?.admin().ping();
    return true;
  } catch {
    return false;
  }
}

export function getMongoConnection(): mongoose.Connection {
  return mongoose.connection;
}

export default mongoose;