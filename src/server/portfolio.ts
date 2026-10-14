import "server-only";

import { connection } from "next/server";

import { computeRisk, deviationDays } from "@/features/portfolio/lib/risk";
import {
  OPEN_DEFECT_STATUSES,
  RISK_LEVELS,
  type QaPhase,
  type RiskLevel,
} from "@/lib/qa-status";

import { getDb } from "./db";

export type PortfolioProject = {
  id: string;
  key: string;
  name: string;
  leadName: string | null;
  qaPhase: QaPhase;
  /** Fecha de solo día (UTC 00:00). */
  estimatedDate: Date | null;
  deviationDays: number | null;
  openCritical: number;
  openHigh: number;
  risk: RiskLevel;
  riskIsManual: boolean;
};

/**
 * Proyectos del portafolio con su riesgo calculado, del más riesgoso al menos.
 * Dinámico: `connection()` excluye la consulta del prerender (el build no necesita MySQL).
 */
export async function listPortfolioProjects(): Promise<PortfolioProject[]> {
  await connection();
  const db = getDb();

  const [projects, openDefects] = await Promise.all([
    db.project.findMany({
      select: {
        id: true,
        key: true,
        name: true,
        qaPhase: true,
        estimatedDate: true,
        originalCommitDate: true,
        manualRisk: true,
        qaLead: { select: { name: true } },
      },
    }),
    db.defect.groupBy({
      by: ["projectId", "severity"],
      where: {
        status: { in: [...OPEN_DEFECT_STATUSES] },
        severity: { in: ["critica", "alta"] },
      },
      _count: { _all: true },
    }),
  ]);

  const openCount = (projectId: string, severity: "critica" | "alta") =>
    openDefects.find(
      (row) => row.projectId === projectId && row.severity === severity,
    )?._count._all ?? 0;

  return projects
    .map((project) => {
      const openCritical = openCount(project.id, "critica");
      const openHigh = openCount(project.id, "alta");
      return {
        id: project.id,
        key: project.key,
        name: project.name,
        leadName: project.qaLead?.name ?? null,
        qaPhase: project.qaPhase,
        estimatedDate: project.estimatedDate,
        deviationDays: deviationDays(
          project.estimatedDate,
          project.originalCommitDate,
        ),
        openCritical,
        openHigh,
        risk: computeRisk({
          openCritical,
          openHigh,
          estimatedDate: project.estimatedDate,
          originalCommitDate: project.originalCommitDate,
          manualRisk: project.manualRisk,
        }),
        riskIsManual: project.manualRisk !== null,
      };
    })
    .sort(
      (a, b) =>
        RISK_LEVELS.indexOf(a.risk) - RISK_LEVELS.indexOf(b.risk) ||
        (a.estimatedDate?.getTime() ?? Infinity) -
          (b.estimatedDate?.getTime() ?? Infinity),
    );
}
