import { z } from "zod";

import {
  Environment,
  RunStatus,
  RunType,
  SmokeVerdict,
} from "../generated/prisma/enums";

// SemVer 2.0.0 (https://semver.org), con prefijo "v" opcional: v3.1.2-beta, 2.0.1-rc1
const SEMVER =
  /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Reglas de una corrida que la base no puede expresar:
 * - El ciclo es obligatorio salvo en corridas exploratorias.
 * - Smoke: versión SemVer y URL del ambiente obligatorias; veredicto al completarse.
 */
export const testRunSchema = z
  .object({
    cycleId: z.string().nullable(),
    type: z.enum(RunType),
    environment: z.enum(Environment),
    status: z.enum(RunStatus),
    buildVersion: z.string().trim().nullable(),
    environmentUrl: z.url().nullable(),
    smokeVerdict: z.enum(SmokeVerdict).nullable(),
  })
  .superRefine((run, ctx) => {
    if (run.type !== "exploratoria" && !run.cycleId) {
      ctx.addIssue({
        code: "custom",
        path: ["cycleId"],
        message:
          "La corrida necesita un ciclo (solo las exploratorias pueden ir sin ciclo)",
      });
    }
    if (run.type !== "smoke") return;
    if (!run.buildVersion || !SEMVER.test(run.buildVersion)) {
      ctx.addIssue({
        code: "custom",
        path: ["buildVersion"],
        message: "El smoke necesita una versión SemVer (p. ej. 1.4.0)",
      });
    }
    if (!run.environmentUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["environmentUrl"],
        message: "El smoke necesita la URL del ambiente",
      });
    }
    if (run.status === "completada" && !run.smokeVerdict) {
      ctx.addIssue({
        code: "custom",
        path: ["smokeVerdict"],
        message:
          "Un smoke completado necesita veredicto (certificado o rechazado)",
      });
    }
  });

export type TestRunInput = z.infer<typeof testRunSchema>;
