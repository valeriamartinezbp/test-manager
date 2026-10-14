import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "./generated/prisma/client";

/**
 * Prisma 7 requiere un driver adapter; para MySQL se usa el de MariaDB.
 * El adapter escribe y lee DATETIME en UTC. Lo usan src/server/db.ts y prisma/seed.ts.
 */
export function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
}
