import {
  ArrowDown,
  ArrowUp,
  Ban,
  CircleCheck,
  CircleCheckBig,
  CircleDashed,
  CircleDot,
  CircleX,
  Clock,
  Copy,
  Equal,
  FilePen,
  Flag,
  FlaskConical,
  OctagonAlert,
  OctagonX,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  ThumbsDown,
  TriangleAlert,
  UserCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/*
 * Vocabulario central de QA. Los valores son los que usarán los enums de Prisma;
 * las etiquetas son el texto visible en la UI.
 */

export const TEST_RESULTS = [
  "sin_ejecutar",
  "aprobado",
  "fallido",
  "bloqueado",
  "omitido",
] as const;
export type TestResult = (typeof TEST_RESULTS)[number];

export const SEVERITIES = ["critica", "alta", "media", "baja"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const DEFECT_STATUSES = [
  "nuevo",
  "asignado",
  "en_curso",
  "re_test",
  "cerrado",
  "reabierto",
  "diferido",
  "rechazado",
  "duplicado",
] as const;
export type DefectStatus = (typeof DEFECT_STATUSES)[number];

/**
 * Estados que cuentan como defecto abierto (riesgo, quality gates).
 * Fuera: cerrado, rechazado, duplicado y diferido (pospuesto a propósito).
 */
export const OPEN_DEFECT_STATUSES = [
  "nuevo",
  "asignado",
  "en_curso",
  "re_test",
  "reabierto",
] as const satisfies readonly DefectStatus[];

export const RUN_STATUSES = [
  "borrador",
  "en_curso",
  "pausada",
  "completada",
] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const TRAFFIC_LIGHTS = ["en_meta", "atencion", "fuera_de_meta"] as const;
export type TrafficLight = (typeof TRAFFIC_LIGHTS)[number];

export const RISK_LEVELS = ["alto", "medio", "bajo"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

/** Fase de QA de un proyecto (portafolio). No es un estado: solo etiqueta. */
export const QA_PHASES = [
  "planeacion",
  "diseno",
  "preparacion_datos",
  "ejecucion",
  "regresion",
  "rendimiento",
  "uat",
  "cierre",
] as const;
export type QaPhase = (typeof QA_PHASES)[number];

export const QA_PHASE_LABELS: Readonly<Record<QaPhase, string>> = {
  planeacion: "Planeación",
  diseno: "Diseño",
  preparacion_datos: "Preparación de datos",
  ejecucion: "Ejecución de casos",
  regresion: "Pruebas de regresión",
  rendimiento: "Pruebas de rendimiento",
  uat: "UAT",
  cierre: "Cierre",
};

/** Tokens semánticos definidos en src/app/globals.css. */
export const QA_TOKENS = [
  "result-not-run",
  "result-passed",
  "result-failed",
  "result-blocked",
  "result-skipped",
  "severity-critical",
  "severity-high",
  "severity-medium",
  "severity-low",
  "status-good",
  "status-warning",
  "status-critical",
  "run-draft",
  "run-active",
  "run-paused",
  "run-completed",
] as const;
export type QaToken = (typeof QA_TOKENS)[number];

export type QaStatusDefinition = {
  label: string;
  icon: LucideIcon;
  token: QaToken;
};

type QaValueByDomain = {
  testResult: TestResult;
  severity: Severity;
  defectStatus: DefectStatus;
  runStatus: RunStatus;
  trafficLight: TrafficLight;
  riskLevel: RiskLevel;
};

export type QaDomain = keyof QaValueByDomain;
export type QaValue<D extends QaDomain> = QaValueByDomain[D];

export const QA_DOMAIN_VALUES: {
  readonly [D in QaDomain]: readonly QaValue<D>[];
} = {
  testResult: TEST_RESULTS,
  severity: SEVERITIES,
  defectStatus: DEFECT_STATUSES,
  runStatus: RUN_STATUSES,
  trafficLight: TRAFFIC_LIGHTS,
  riskLevel: RISK_LEVELS,
};

export const QA_STATUS: {
  readonly [D in QaDomain]: Readonly<Record<QaValue<D>, QaStatusDefinition>>;
} = {
  testResult: {
    sin_ejecutar: {
      label: "Sin ejecutar",
      icon: CircleDashed,
      token: "result-not-run",
    },
    aprobado: { label: "Aprobado", icon: CircleCheck, token: "result-passed" },
    fallido: { label: "Fallido", icon: CircleX, token: "result-failed" },
    bloqueado: { label: "Bloqueado", icon: Ban, token: "result-blocked" },
    omitido: { label: "Omitido", icon: SkipForward, token: "result-skipped" },
  },
  severity: {
    critica: {
      label: "Crítica",
      icon: OctagonAlert,
      token: "severity-critical",
    },
    alta: { label: "Alta", icon: ArrowUp, token: "severity-high" },
    media: { label: "Media", icon: Equal, token: "severity-medium" },
    baja: { label: "Baja", icon: ArrowDown, token: "severity-low" },
  },
  defectStatus: {
    nuevo: { label: "Nuevo", icon: CircleDot, token: "run-active" },
    asignado: { label: "Asignado", icon: UserCheck, token: "run-active" },
    en_curso: { label: "En curso", icon: Wrench, token: "run-active" },
    re_test: { label: "Re-test", icon: FlaskConical, token: "status-warning" },
    cerrado: { label: "Cerrado", icon: CircleCheckBig, token: "status-good" },
    reabierto: {
      label: "Reabierto",
      icon: RotateCcw,
      token: "status-critical",
    },
    diferido: { label: "Diferido", icon: Clock, token: "run-paused" },
    rechazado: { label: "Rechazado", icon: ThumbsDown, token: "run-draft" },
    duplicado: { label: "Duplicado", icon: Copy, token: "result-skipped" },
  },
  runStatus: {
    borrador: { label: "Borrador", icon: FilePen, token: "run-draft" },
    en_curso: { label: "En curso", icon: Play, token: "run-active" },
    pausada: { label: "Pausada", icon: Pause, token: "run-paused" },
    completada: { label: "Completada", icon: Flag, token: "run-completed" },
  },
  trafficLight: {
    en_meta: { label: "En meta", icon: CircleCheck, token: "status-good" },
    atencion: {
      label: "Atención",
      icon: TriangleAlert,
      token: "status-warning",
    },
    fuera_de_meta: {
      label: "Fuera de meta",
      icon: OctagonX,
      token: "status-critical",
    },
  },
  riskLevel: {
    alto: { label: "Alto", icon: OctagonAlert, token: "status-critical" },
    medio: { label: "Medio", icon: TriangleAlert, token: "status-warning" },
    bajo: { label: "Bajo", icon: CircleCheck, token: "status-good" },
  },
};

export function getQaStatus<D extends QaDomain>(
  domain: D,
  value: QaValue<D>,
): QaStatusDefinition {
  return QA_STATUS[domain][value];
}
