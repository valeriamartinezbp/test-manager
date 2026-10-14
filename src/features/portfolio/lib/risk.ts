import type { RiskLevel } from "@/lib/qa-status";

/** Umbrales de riesgo del portafolio (CLAUDE.md › Reglas de negocio). */
export const RISK_THRESHOLDS = {
  high: { openCritical: 2, deviationDays: 7 },
  medium: { openCritical: 1, openHigh: 2, deviationDays: 2 },
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Desviación en días naturales: fecha estimada − fecha compromiso original.
 * Positiva = retraso; negativa = adelanto. Ambas fechas son de solo día (UTC).
 * Devuelve null si falta alguna de las dos.
 */
export function deviationDays(
  estimatedDate: Date | null,
  originalCommitDate: Date | null,
): number | null {
  if (!estimatedDate || !originalCommitDate) return null;
  const toUtcDay = (date: Date) =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.round(
    (toUtcDay(estimatedDate) - toUtcDay(originalCommitDate)) / DAY_MS,
  );
}

export type RiskInput = {
  openCritical: number;
  openHigh: number;
  estimatedDate: Date | null;
  originalCommitDate: Date | null;
  manualRisk: RiskLevel | null;
};

/**
 * Riesgo del proyecto. El riesgo fijado manualmente tiene prioridad.
 * - Alto: 2+ críticos abiertos o 7+ días de desviación.
 * - Medio: 1 crítico, 2+ altos o 2+ días de desviación.
 * - Bajo: cualquier otro caso (incluye adelantos y fechas sin capturar).
 */
export function computeRisk(input: RiskInput): RiskLevel {
  if (input.manualRisk) return input.manualRisk;

  const deviation =
    deviationDays(input.estimatedDate, input.originalCommitDate) ?? 0;
  const { high, medium } = RISK_THRESHOLDS;

  if (
    input.openCritical >= high.openCritical ||
    deviation >= high.deviationDays
  ) {
    return "alto";
  }
  if (
    input.openCritical >= medium.openCritical ||
    input.openHigh >= medium.openHigh ||
    deviation >= medium.deviationDays
  ) {
    return "medio";
  }
  return "bajo";
}
