import "server-only";

import { createPrismaClient } from "./create-prisma-client";
import { getServerEnv } from "./env";
import type { PrismaClient } from "./generated/prisma/client";

// Un solo cliente por proceso; en desarrollo sobrevive al hot reload en globalThis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient(getServerEnv().DATABASE_URL);
  }
  return globalForPrisma.prisma;
}
