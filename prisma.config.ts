import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: la conexión vive aquí, no en schema.prisma.
// Se usa process.env (no `env()`) porque `env()` lanza si la variable falta, y
// `prisma generate` / `prisma validate` deben funcionar en CI sin base de datos.
// La validación estricta de las variables del servidor está en src/server/env.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
