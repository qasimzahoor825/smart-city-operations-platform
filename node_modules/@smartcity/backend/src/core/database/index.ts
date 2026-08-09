import { prisma } from "@smartcity/database";
import type { Prisma, PrismaClient } from "@prisma/client";

export type PrismaTx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
export type PrismaTransaction = Prisma.TransactionClient;

export { prisma, default as database } from "@smartcity/database";

export async function pingDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}