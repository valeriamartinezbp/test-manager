import { z } from "zod";

const mysqlUrl = z.url({
  protocol: /^mysql$/,
  error: "Debe ser una URL mysql://usuario:clave@host:puerto/base",
});

const serverEnvSchema = z.object({
  DATABASE_URL: mysqlUrl,
  SHADOW_DATABASE_URL: mysqlUrl.optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/**
 * Variables de entorno del servidor validadas con Zod.
 * Se valida al primer uso (no al importar) para que `next build` funcione sin base de datos.
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Solo nombres de variables y mensajes: nunca valores (pueden traer la clave).
    const problems = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Variables de entorno del servidor inválidas:\n${problems}`,
    );
  }
  cached = parsed.data;
  return cached;
}
