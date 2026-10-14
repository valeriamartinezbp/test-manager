/**
 * Candado de compilación: los enums de Prisma deben tener exactamente los valores del
 * vocabulario de src/lib/qa-status.ts. Si alguno diverge, `npm run typecheck` falla aquí.
 */
import type {
  DefectStatus,
  QaPhase,
  RiskLevel,
  RunStatus,
  Severity,
  TestResult,
} from "@/lib/qa-status";

import type * as Db from "./generated/prisma/enums";

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

export type VocabularyMatchesSchema = [
  Assert<Equals<Db.TestResult, TestResult>>,
  Assert<Equals<Db.Severity, Severity>>,
  Assert<Equals<Db.DefectStatus, DefectStatus>>,
  Assert<Equals<Db.RunStatus, RunStatus>>,
  Assert<Equals<Db.RiskLevel, RiskLevel>>,
  Assert<Equals<Db.QaPhase, QaPhase>>,
];
