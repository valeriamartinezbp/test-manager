/**
 * Seed idempotente (upsert por claves naturales): `npm run db:seed`.
 * Fuente: "QA Center · Contexto del proyecto" (portafolio al 13/10/2026).
 * Lo que el documento no detalla se marca en el propio registro (ver "sintético").
 */
import "dotenv/config";

import { createPrismaClient } from "../src/server/create-prisma-client";
import { getServerEnv } from "../src/server/env";
import type {
  DefectStatus,
  Prisma,
  PrismaClient,
} from "../src/server/generated/prisma/client";
import { formatKey, type KeyPrefix } from "../src/server/keys";
import {
  testCaseStepsSchema,
  type TestCaseStep,
} from "../src/server/schemas/test-case";
import { testRunSchema } from "../src/server/schemas/test-run";

const db: PrismaClient = createPrismaClient(getServerEnv().DATABASE_URL);

/** Fecha de solo día (UTC 00:00). */
const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
/** Instante en UTC. */
const at = (iso: string) => new Date(iso);
/** Día sin hora conocida: se registra a las 12:00 de Ciudad de México (18:00 UTC). */
const midday = (iso: string) => new Date(`${iso}T18:00:00.000Z`);

// ───────────────────────── Roles y permisos ─────────────────────────

const PERMISSIONS = [
  ["proyectos.ver", "Proyectos", "Ver proyectos y portafolio"],
  ["proyectos.gestionar", "Proyectos", "Crear y editar proyectos"],
  ["equipo.asignar", "Equipo", "Asignar personas a proyectos"],
  ["casos.ver", "Casos", "Ver casos de prueba"],
  ["casos.crear", "Casos", "Crear y editar casos de prueba"],
  ["casos.revisar", "Casos", "Revisar y aprobar casos"],
  ["casos.automatizar", "Casos", "Automatizar casos"],
  ["ejecuciones.ver", "Ejecuciones", "Ver ejecuciones"],
  ["ejecuciones.crear", "Ejecuciones", "Crear ejecuciones"],
  [
    "ejecuciones.ejecutar",
    "Ejecuciones",
    "Ejecutar casos y registrar resultados",
  ],
  ["defectos.ver", "Defectos", "Ver defectos"],
  ["defectos.crear", "Defectos", "Registrar defectos"],
  [
    "defectos.gestionar",
    "Defectos",
    "Asignar y cambiar el estatus de defectos",
  ],
  ["defectos.rca", "Defectos", "Registrar análisis de causa raíz"],
  ["releases.ver", "Releases", "Ver releases"],
  ["releases.gestionar", "Releases", "Gestionar releases y go/no-go"],
  ["despliegues.registrar", "Releases", "Registrar despliegues"],
  ["metricas.ver", "Métricas", "Ver dashboards y reportes"],
  ["metricas.configurar", "Métricas", "Configurar métricas y metas"],
  ["sla.configurar", "Métricas", "Configurar SLA"],
  ["documentos.ver", "Documentos", "Ver documentos"],
  ["documentos.editar", "Documentos", "Crear y editar documentos"],
  ["documentos.firmar", "Documentos", "Firmar documentos"],
  ["reporte_diario.enviar", "Reportes", "Enviar reporte diario"],
  ["mejoras.proponer", "Mejoras", "Proponer mejoras"],
  ["mejoras.votar", "Mejoras", "Votar mejoras"],
  ["uat.portal", "UAT", "Usar el portal UAT"],
] as const;

type PermissionKey = (typeof PERMISSIONS)[number][0];
const ALL_PERMISSIONS = PERMISSIONS.map(([key]) => key);

const QA_MID_PERMISSIONS: PermissionKey[] = [
  "proyectos.ver",
  "casos.ver",
  "casos.crear",
  "casos.automatizar",
  "ejecuciones.ver",
  "ejecuciones.crear",
  "ejecuciones.ejecutar",
  "defectos.ver",
  "defectos.crear",
  "defectos.rca",
  "releases.ver",
  "metricas.ver",
  "documentos.ver",
  "reporte_diario.enviar",
  "mejoras.proponer",
  "mejoras.votar",
];

// Alcance por rol según el documento de contexto (sección 2. Roles).
// Accesos (personas, permisos, suspensión, bitácora) es exclusivo de la dueña (User.isOwner).
const ROLES: {
  key: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
}[] = [
  {
    key: "qa_manager",
    name: "QA Manager",
    description: "Todo: proyectos, equipo, métricas, SLA, releases y firmas.",
    permissions: ALL_PERMISSIONS.filter((key) => key !== "uat.portal"),
  },
  {
    key: "direccion",
    name: "Dirección",
    description: "Solo lectura de dashboards.",
    permissions: ["proyectos.ver", "metricas.ver"],
  },
  {
    key: "qa_lead",
    name: "QA Lead",
    description:
      "Planea, asigna, revisa casos, configura métricas y gestiona releases.",
    permissions: ALL_PERMISSIONS.filter(
      (key) =>
        !["sla.configurar", "documentos.firmar", "uat.portal"].includes(key),
    ),
  },
  {
    key: "qa_mid",
    name: "QA Mid",
    description:
      "Diseña y automatiza casos, crea ejecuciones, registra defectos y RCA.",
    permissions: QA_MID_PERMISSIONS,
  },
  {
    key: "qa_junior",
    name: "QA Junior",
    description:
      "Ejecuta casos y registra defectos. Sus casos nuevos quedan en revisión.",
    permissions: [
      "proyectos.ver",
      "casos.ver",
      "casos.crear",
      "ejecuciones.ver",
      "ejecuciones.ejecutar",
      "defectos.ver",
      "defectos.crear",
      "documentos.ver",
      "reporte_diario.enviar",
      "mejoras.proponer",
      "mejoras.votar",
    ],
  },
  {
    key: "trainer",
    name: "Trainer",
    description: "Revisa y aprueba casos, documenta y acompaña a los testers.",
    permissions: [
      "proyectos.ver",
      "casos.ver",
      "casos.crear",
      "casos.revisar",
      "ejecuciones.ver",
      "defectos.ver",
      "documentos.ver",
      "documentos.editar",
      "metricas.ver",
      "mejoras.proponer",
      "mejoras.votar",
    ],
  },
  {
    key: "desarrollo",
    name: "Desarrollo",
    description: "Atiende defectos, registra RCA y despliegues (DORA).",
    permissions: [
      "proyectos.ver",
      "casos.ver",
      "defectos.ver",
      "defectos.gestionar",
      "defectos.rca",
      "releases.ver",
      "despliegues.registrar",
      "mejoras.proponer",
      "mejoras.votar",
    ],
  },
  {
    key: "cliente_uat",
    name: "Cliente UAT",
    description: "Solo el portal UAT para reportar defectos y sugerencias.",
    permissions: ["uat.portal"],
  },
];

async function seedRolesAndPermissions() {
  const permissionIds = new Map<string, string>();
  for (const [key, group, label] of PERMISSIONS) {
    const permission = await db.permission.upsert({
      where: { key },
      create: { key, group, label },
      update: { group, label },
    });
    permissionIds.set(key, permission.id);
  }

  const roleIds = new Map<string, string>();
  for (const role of ROLES) {
    const { id } = await db.role.upsert({
      where: { key: role.key },
      create: {
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: true,
      },
      update: {
        name: role.name,
        description: role.description,
        isSystem: true,
      },
    });
    roleIds.set(role.key, id);

    const wanted = role.permissions.map((key) => {
      const permissionId = permissionIds.get(key);
      if (!permissionId) throw new Error(`Permiso desconocido: ${key}`);
      return permissionId;
    });
    // La matriz del seed es la fuente de verdad de los roles de sistema
    await db.rolePermission.deleteMany({
      where: { roleId: id, permissionId: { notIn: wanted } },
    });
    for (const permissionId of wanted) {
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: id, permissionId } },
        create: { roleId: id, permissionId },
        update: {},
      });
    }
  }
  return roleIds;
}

// ───────────────────────────── Personas ─────────────────────────────

const USERS = [
  {
    key: "edith",
    email: "edith.guzman@example.com",
    name: "Edith Guzmán",
    isOwner: true,
  },
  { key: "dani", email: "dani@example.com", name: "Dani" },
  {
    key: "valeria",
    email: "valeria.martinez@example.com",
    name: "Valeria Martínez",
  },
  { key: "ludwig", email: "ludwig.garcia@example.com", name: "Ludwig García" },
  { key: "ema", email: "ema@example.com", name: "Ema" },
  { key: "luis", email: "luis.mendez@example.com", name: "Luis Méndez" },
  { key: "ana", email: "ana.silva@example.com", name: "Ana Silva" },
  { key: "carlos", email: "carlos.ruiz@example.com", name: "Carlos Ruiz" },
  // Responsables de defectos en el documento: equipos, registrados como cuentas de equipo
  { key: "devBackend", email: "dev.backend@example.com", name: "Dev Backend" },
  { key: "devFront", email: "dev.front@example.com", name: "Dev Front" },
] as const;

type UserKey = (typeof USERS)[number]["key"];

async function seedUsers() {
  const ids = new Map<UserKey, string>();
  for (const user of USERS) {
    const isOwner = "isOwner" in user && user.isOwner;
    const { id } = await db.user.upsert({
      where: { email: user.email },
      create: { email: user.email, name: user.name, status: "activo", isOwner },
      update: { name: user.name, status: "activo", isOwner },
    });
    ids.set(user.key, id);
  }
  return (key: UserKey) => {
    const id = ids.get(key);
    if (!id) throw new Error(`Usuario no sembrado: ${key}`);
    return id;
  };
}

// ───────────────────────────── Proyectos ─────────────────────────────

type ProjectSeed = {
  key: string;
  name: string;
  qaPhase: Prisma.ProjectCreateInput["qaPhase"];
  lead: UserKey | null;
  progressPercent: number;
  estimatedDate: string;
  // Fecha estimada − desviación del control de liberaciones
  originalCommitDate: string;
  uatOpen: boolean;
  observations: string | null;
};

// Control operativo de liberaciones al 13/10/2026
const PROJECTS: ProjectSeed[] = [
  {
    key: "GTW",
    name: "Gateway Pagos",
    qaPhase: "rendimiento",
    lead: "luis",
    progressPercent: 40,
    estimatedDate: "2026-09-10",
    originalCommitDate: "2026-08-31", // +10 días
    uatOpen: false,
    observations:
      "Ambiente inestable. Intermitencia en base de datos bloqueando pruebas de carga.",
  },
  {
    key: "APP",
    name: "App Móvil v2.0",
    qaPhase: "regresion",
    lead: "ana",
    progressPercent: 70,
    estimatedDate: "2026-08-25",
    originalCommitDate: "2026-08-22", // +3 días
    uatOpen: false,
    observations:
      "Retraso por ajustes en API de autenticación. Pendiente re-test del defecto crítico.",
  },
  {
    key: "DEI",
    name: "Deiman",
    qaPhase: "uat",
    lead: null,
    progressPercent: 66.7,
    estimatedDate: "2026-10-30",
    originalCommitDate: "2026-10-30",
    uatOpen: true,
    observations: null,
  },
  {
    key: "PCL",
    name: "Portal Clientes",
    qaPhase: "ejecucion",
    lead: "carlos",
    progressPercent: 85,
    estimatedDate: "2026-09-01",
    originalCommitDate: "2026-09-01",
    uatOpen: false,
    observations: "Sin bloqueadores mayores. Criterios de aceptación estables.",
  },
  {
    key: "MRE",
    name: "Módulo Reportes",
    qaPhase: "preparacion_datos",
    lead: "ana",
    progressPercent: 10,
    estimatedDate: "2026-09-15",
    originalCommitDate: "2026-09-16", // −1 día
    uatOpen: false,
    observations:
      "Preparación adelantada. Scripts automatizados listos para ejecución.",
  },
  {
    key: "APAC",
    name: "APAC",
    qaPhase: "planeacion",
    lead: null,
    progressPercent: 0,
    estimatedDate: "2026-10-12",
    originalCommitDate: "2026-10-12",
    uatOpen: false,
    observations: "Sin datos de ejecución todavía.",
  },
  {
    key: "EXI",
    name: "Exinware",
    qaPhase: "uat",
    lead: null,
    progressPercent: 0,
    estimatedDate: "2026-12-31",
    originalCommitDate: "2026-12-31",
    uatOpen: true,
    observations: "Sin datos de ejecución todavía.",
  },
];

const SLA_DEFAULTS = [
  { severity: "critica", responseHours: 4, resolutionHours: 24 },
  { severity: "alta", responseHours: 8, resolutionHours: 72 },
  { severity: "media", responseHours: 24, resolutionHours: 120 },
  { severity: "baja", responseHours: 48, resolutionHours: 240 },
] as const;

async function seedProjects(
  userId: (key: UserKey) => string,
  roleIds: Map<string, string>,
) {
  const projectIds = new Map<string, string>();
  const roleId = (key: string) => {
    const id = roleIds.get(key);
    if (!id) throw new Error(`Rol no sembrado: ${key}`);
    return id;
  };

  for (const project of PROJECTS) {
    const data = {
      name: project.name,
      qaPhase: project.qaPhase,
      qaLeadId: project.lead ? userId(project.lead) : null,
      progressPercent: project.progressPercent,
      estimatedDate: day(project.estimatedDate),
      originalCommitDate: day(project.originalCommitDate),
      uatOpen: project.uatOpen,
      observations: project.observations,
    };
    const { id } = await db.project.upsert({
      where: { key: project.key },
      create: { key: project.key, ...data },
      update: data,
    });
    projectIds.set(project.key, id);

    // Configuración con los valores por defecto del esquema
    await db.projectSettings.upsert({
      where: { projectId: id },
      create: { projectId: id },
      update: {},
    });
    for (const sla of SLA_DEFAULTS) {
      await db.slaPolicy.upsert({
        where: {
          projectId_severity: { projectId: id, severity: sla.severity },
        },
        create: { projectId: id, ...sla },
        update: {
          responseHours: sla.responseHours,
          resolutionHours: sla.resolutionHours,
        },
      });
    }

    const members: [UserKey, string][] = [
      ["edith", "qa_manager"],
      ["dani", "direccion"],
    ];
    if (project.lead) members.push([project.lead, "qa_lead"]);
    for (const [user, role] of members) {
      await db.membership.upsert({
        where: { userId_projectId: { userId: userId(user), projectId: id } },
        create: { userId: userId(user), projectId: id, roleId: roleId(role) },
        update: { roleId: roleId(role) },
      });
    }
  }

  // Equipo de Deiman (proyecto con datos completos de Test Manager)
  const deiman = projectIds.get("DEI");
  if (!deiman) throw new Error("Falta Deiman");
  const deimanTeam: [UserKey, string][] = [
    ["valeria", "qa_mid"],
    ["ludwig", "qa_mid"],
    ["ema", "qa_mid"],
    ["devBackend", "desarrollo"],
    ["devFront", "desarrollo"],
  ];
  for (const [user, role] of deimanTeam) {
    await db.membership.upsert({
      where: { userId_projectId: { userId: userId(user), projectId: deiman } },
      create: { userId: userId(user), projectId: deiman, roleId: roleId(role) },
      update: { roleId: roleId(role) },
    });
  }

  return (key: string) => {
    const id = projectIds.get(key);
    if (!id) throw new Error(`Proyecto no sembrado: ${key}`);
    return id;
  };
}

// ─────────────────── Despliegues y cambios de alcance ───────────────────

async function seedDeploymentsAndScopeChanges(
  projectId: (key: string) => string,
) {
  const deployments: Prisma.DeploymentUncheckedCreateInput[] = [
    {
      projectId: projectId("PCL"),
      version: "v1.5.0",
      deployedAt: midday("2026-08-12"),
      environment: "uat",
      requestedBy: "Product Owner",
      status: "exitoso",
      prodApproval: "si",
    },
    {
      projectId: projectId("APP"),
      version: "v2.0.1-rc1",
      deployedAt: midday("2026-08-15"),
      environment: "qa",
      requestedBy: "Equipo Dev (Backend)",
      status: "exitoso",
      prodApproval: "pendiente",
    },
    {
      projectId: projectId("GTW"),
      version: "v3.1.2-beta",
      deployedAt: midday("2026-08-16"),
      environment: "staging",
      requestedBy: "DevOps",
      status: "con_errores",
      prodApproval: "no",
      notes: "Rollback.",
    },
    {
      projectId: projectId("APP"),
      version: "v2.0.1-rc2",
      deployedAt: midday("2026-08-18"),
      environment: "qa",
      requestedBy: "Equipo Dev (Backend)",
      status: "exitoso",
      prodApproval: "pendiente",
    },
    {
      projectId: projectId("GTW"),
      version: "v3.1.3-beta",
      deployedAt: midday("2026-08-18"),
      environment: "qa",
      requestedBy: "DevOps",
      status: "en_progreso",
      prodApproval: "pendiente",
    },
    {
      projectId: projectId("DEI"),
      version: "1.17 (APAC)",
      deployedAt: midday("2026-10-09"),
      environment: "qa",
      requestedBy: "Dev Backend",
      status: "en_progreso",
      prodApproval: "pendiente",
      notes: "Estatus reportado: En pruebas.",
    },
  ];
  for (const deployment of deployments) {
    const { projectId: project, version, environment, ...rest } = deployment;
    await db.deployment.upsert({
      where: {
        projectId_version_environment: {
          projectId: project,
          version,
          environment,
        },
      },
      create: deployment,
      update: rest,
    });
  }

  const scopeChanges: Prisma.ScopeChangeUncheckedCreateInput[] = [
    {
      projectId: projectId("MRE"),
      key: "BUG-104",
      description: "Fallo al exportar a Excel con más de 10k filas",
      type: "correccion",
      status: "liberado",
      requestedAt: day("2026-08-05"),
      requestedBy: "Soporte",
      impact: "medio",
    },
    {
      projectId: projectId("APP"),
      key: "REQ-001",
      description: "Inicio de sesión con Biometría (FaceID/Huella)",
      type: "nueva_funcionalidad",
      status: "aprobado",
      requestedAt: day("2026-08-10"),
      requestedBy: "Negocio",
      impact: "alto",
    },
    {
      projectId: projectId("PCL"),
      key: "REQ-002",
      description: "Descarga masiva de estados de cuenta PDF",
      type: "mejora",
      status: "en_qa",
      requestedAt: day("2026-08-12"),
      requestedBy: "Product Owner",
      impact: "medio",
    },
    {
      projectId: projectId("GTW"),
      key: "REQ-003",
      description: "Soporte para procesar tarjetas AMEX",
      type: "nueva_funcionalidad",
      status: "en_analisis",
      requestedAt: day("2026-08-15"),
      requestedBy: "Finanzas",
      impact: "alto",
    },
    {
      projectId: projectId("APP"),
      key: "REQ-001-B",
      description: "Cambio de diseño en pantalla de Biometría",
      type: "cambio_alcance",
      status: "rechazado",
      requestedAt: day("2026-08-17"),
      requestedBy: "UI/UX",
      impact: "bajo",
    },
  ];
  for (const change of scopeChanges) {
    const { projectId: project, key, ...rest } = change;
    await db.scopeChange.upsert({
      where: { projectId_key: { projectId: project, key } },
      create: change,
      update: rest,
    });
  }
}

// ─────────── Defectos abiertos del corte (sin detalle en el documento) ───────────

const SYNTHETIC_NOTE =
  "Registro sintético: reproduce el conteo de defectos abiertos del control de liberaciones " +
  "al 13/10/2026, que no detalla cada defecto. Sustitúyelo por el defecto real.";

async function seedPortfolioOpenDefects(
  projectId: (key: string) => string,
  counters: KeyCounterTracker,
) {
  const openDefects: {
    project: string;
    severity: "critica" | "alta";
    status: DefectStatus;
  }[] = [
    ...Array.from({ length: 4 }, () => ({
      project: "GTW",
      severity: "critica" as const,
      status: "nuevo" as const,
    })),
    ...Array.from({ length: 5 }, () => ({
      project: "GTW",
      severity: "alta" as const,
      status: "nuevo" as const,
    })),
    // "Pendiente re-test del defecto crítico"
    { project: "APP", severity: "critica", status: "re_test" },
    ...Array.from({ length: 3 }, () => ({
      project: "APP",
      severity: "alta" as const,
      status: "nuevo" as const,
    })),
    { project: "PCL", severity: "alta", status: "nuevo" },
  ];

  const seen = new Map<string, number>();
  for (const defect of openDefects) {
    const number = (seen.get(defect.project) ?? 0) + 1;
    seen.set(defect.project, number);
    const id = projectId(defect.project);
    const key = formatKey("BUG", number);
    const label = defect.severity === "critica" ? "crítico" : "alto";
    const data = {
      title: `Defecto ${label} abierto sin detalle (corte 13/10/2026)`,
      description: SYNTHETIC_NOTE,
      severity: defect.severity,
      priority: "alta" as const,
      status: defect.status,
      createdAt: at("2026-10-13T18:00:00.000Z"),
    };
    await db.defect.upsert({
      where: { projectId_key: { projectId: id, key } },
      create: { projectId: id, key, ...data },
      update: data,
    });
    counters.track(id, "BUG", number);
  }
}

// ─────────────────────── Deiman: Test Manager completo ───────────────────────

type CaseSeed = {
  key: string;
  suite: string;
  module: "Pagos" | "Autenticación";
  title: string;
  preconditions: string;
  steps: TestCaseStep[];
  priority: "alta" | "media" | "baja";
  platform: "web" | "ios" | "android";
  testType: "funcional" | "regresion" | "smoke";
  automated?: string; // ruta del script de Playwright
  reviewStatus: "aprobado" | "pendiente_revision" | "devuelto";
  author: UserKey;
  requirements: string[];
  tags: string[];
};

const LOGIN_STEP: TestCaseStep = {
  action:
    "Iniciar sesión con el usuario de pruebas qa.pagos (saldo $10,000.00)",
  expectedResult: "Se muestra la pantalla de inicio con el saldo disponible",
};

const DEIMAN_CASES: CaseSeed[] = [
  {
    key: "TC-001",
    suite: "TS-01",
    module: "Pagos",
    title: "Pago SPEI exitoso con CLABE válida",
    preconditions:
      "Usuario con saldo suficiente y token activo. Ambiente UAT disponible.",
    steps: [
      LOGIN_STEP,
      {
        action: "Ir a Pagos › Transferencia SPEI",
        expectedResult: "Se muestra el formulario de transferencia",
      },
      {
        action: "Capturar la CLABE 002180700112345678 y el monto $1,500.00",
        expectedResult: "La CLABE se valida y se muestra el banco destino",
      },
      {
        action: "Capturar el concepto «Pago de servicios» y continuar",
        expectedResult:
          "Se muestra el resumen con monto, comisión y cuenta destino",
      },
      {
        action: "Confirmar con el token de seguridad",
        expectedResult:
          "Se muestra el comprobante con folio y clave de rastreo",
      },
      {
        action: "Abrir Movimientos",
        expectedResult: "Aparece el cargo de $1,500.00 con estatus «Enviado»",
      },
    ],
    priority: "alta",
    platform: "web",
    testType: "funcional",
    automated: "tests/pagos/spei-exitoso.spec.ts",
    reviewStatus: "aprobado",
    author: "valeria",
    requirements: ["REQ-001"],
    tags: ["pagos", "spei", "smoke"],
  },
  {
    key: "TC-002",
    suite: "TS-01",
    module: "Pagos",
    title: "CLABE con dígito verificador incorrecto",
    preconditions: "Usuario con sesión iniciada.",
    steps: [
      LOGIN_STEP,
      {
        action: "Ir a Pagos › Transferencia SPEI",
        expectedResult: "Se muestra el formulario de transferencia",
      },
      {
        action:
          "Capturar la CLABE 002180700112345670 (dígito verificador inválido)",
        expectedResult:
          "Se muestra «La CLABE no es válida» y el botón Continuar queda deshabilitado",
      },
    ],
    priority: "media",
    platform: "web",
    testType: "funcional",
    automated: "tests/pagos/spei-clabe-invalida.spec.ts",
    reviewStatus: "aprobado",
    author: "valeria",
    requirements: ["REQ-001"],
    tags: ["pagos", "spei"],
  },
  {
    key: "TC-003",
    suite: "TS-01",
    module: "Pagos",
    title: "Pago SPEI con saldo insuficiente",
    preconditions: "Usuario de pruebas qa.sinsaldo con saldo de $200.00.",
    steps: [
      {
        action: "Iniciar sesión con el usuario qa.sinsaldo",
        expectedResult: "Se muestra la pantalla de inicio con saldo $200.00",
      },
      {
        action:
          "Capturar una transferencia SPEI por $1,500.00 a una CLABE válida",
        expectedResult: "Se muestra el resumen de la operación",
      },
      {
        action: "Confirmar con el token",
        expectedResult: "Se muestra «Saldo insuficiente» y no se genera cargo",
      },
    ],
    priority: "alta",
    platform: "web",
    testType: "funcional",
    reviewStatus: "aprobado",
    author: "ludwig",
    requirements: ["REQ-001"],
    tags: ["pagos", "spei"],
  },
  {
    key: "TC-004",
    suite: "TS-01",
    module: "Pagos",
    title: "Descarga del comprobante CEP de un pago SPEI",
    preconditions: "Existe un pago SPEI liquidado del día.",
    steps: [
      LOGIN_STEP,
      {
        action: "Abrir Movimientos y seleccionar el pago SPEI liquidado",
        expectedResult: "Se muestra el detalle con la clave de rastreo",
      },
      {
        action: "Elegir «Descargar CEP»",
        expectedResult:
          "Se descarga el PDF del CEP con los datos de la operación",
      },
    ],
    priority: "media",
    platform: "web",
    testType: "funcional",
    reviewStatus: "aprobado",
    author: "ludwig",
    requirements: ["REQ-001"],
    tags: ["pagos", "spei"],
  },
  {
    key: "TC-005",
    suite: "TS-01",
    module: "Pagos",
    title: "Pago SPEI que excede el límite diario",
    preconditions: "Límite diario de transferencias configurado en $50,000.00.",
    steps: [
      LOGIN_STEP,
      {
        action: "Capturar una transferencia SPEI por $60,000.00",
        expectedResult:
          "Se muestra «El monto excede tu límite diario» antes de pedir el token",
      },
    ],
    priority: "media",
    platform: "web",
    testType: "funcional",
    reviewStatus: "aprobado",
    author: "valeria",
    requirements: ["REQ-001"],
    tags: ["pagos", "spei"],
  },
  {
    key: "TC-006",
    suite: "TS-02",
    module: "Pagos",
    title: "Pago con tarjeta de crédito y autenticación 3-D Secure",
    preconditions:
      "Tarjeta de pruebas Visa 4000 0000 0000 3220 (requiere 3-D Secure).",
    steps: [
      LOGIN_STEP,
      {
        action:
          "Ir a Pagos › Pagar con tarjeta y capturar la tarjeta de pruebas",
        expectedResult: "Se valida el número y se muestra la marca Visa",
      },
      {
        action: "Capturar vencimiento 12/28, CVV 123 y monto $850.00",
        expectedResult: "Se habilita el botón Pagar",
      },
      {
        action: "Pagar y completar el reto 3-D Secure",
        expectedResult: "Se muestra el comprobante con número de autorización",
      },
    ],
    priority: "alta",
    platform: "web",
    testType: "funcional",
    automated: "tests/pagos/tarjeta-3ds.spec.ts",
    reviewStatus: "aprobado",
    author: "ludwig",
    requirements: ["REQ-002"],
    tags: ["pagos", "tarjeta"],
  },
  {
    key: "TC-007",
    suite: "TS-02",
    module: "Pagos",
    title: "Pago con tarjeta rechazada por el banco emisor",
    preconditions:
      "Tarjeta de pruebas 4000 0000 0000 0002 (siempre rechazada).",
    steps: [
      LOGIN_STEP,
      {
        action: "Pagar $850.00 con la tarjeta de pruebas rechazada",
        expectedResult:
          "Se muestra «Tu banco rechazó el pago» y no se genera cargo",
      },
    ],
    priority: "alta",
    platform: "web",
    testType: "funcional",
    reviewStatus: "aprobado",
    author: "ludwig",
    requirements: ["REQ-002"],
    tags: ["pagos", "tarjeta"],
  },
  {
    key: "TC-008",
    suite: "TS-02",
    module: "Pagos",
    title: "Validación de fecha de vencimiento y CVV",
    preconditions: "Usuario con sesión iniciada.",
    steps: [
      LOGIN_STEP,
      {
        action: "Capturar una tarjeta con vencimiento 01/24",
        expectedResult: "Se muestra «La tarjeta está vencida»",
      },
      {
        action: "Capturar un CVV de 2 dígitos",
        expectedResult:
          "Se muestra «El CVV debe tener 3 dígitos» y Pagar queda deshabilitado",
      },
    ],
    priority: "media",
    platform: "web",
    testType: "funcional",
    reviewStatus: "aprobado",
    author: "ema",
    requirements: ["REQ-002"],
    tags: ["pagos", "tarjeta"],
  },
  {
    key: "TC-009",
    suite: "TS-02",
    module: "Pagos",
    title: "Pago con tarjeta de débito guardada",
    preconditions: "El usuario tiene una tarjeta de débito guardada.",
    steps: [
      LOGIN_STEP,
      {
        action: "Ir a Pagos › Pagar con tarjeta y elegir la tarjeta guardada",
        expectedResult:
          "Se muestran los últimos 4 dígitos y solo se pide el CVV",
      },
      {
        action: "Capturar el CVV y pagar $300.00",
        expectedResult: "Se muestra el comprobante de pago",
      },
    ],
    priority: "baja",
    platform: "web",
    testType: "funcional",
    reviewStatus: "aprobado",
    author: "ema",
    requirements: ["REQ-002"],
    tags: ["pagos", "tarjeta"],
  },
  {
    key: "TC-010",
    suite: "TS-03",
    module: "Autenticación",
    title: "Inicio de sesión en iOS con usuario y contraseña",
    preconditions: "App instalada en iPhone 15 con iOS 26. Usuario activo.",
    steps: [
      {
        action: "Abrir la app",
        expectedResult: "Se muestra la pantalla de inicio de sesión completa",
      },
      {
        action: "Verificar el botón «Iniciar sesión»",
        expectedResult: "El botón se ve completo, sin cortes, y es tocable",
      },
      {
        action: "Capturar usuario y contraseña válidos e iniciar sesión",
        expectedResult: "Se muestra la pantalla de inicio con el saldo",
      },
    ],
    priority: "alta",
    platform: "ios",
    testType: "regresion",
    reviewStatus: "aprobado",
    author: "valeria",
    requirements: ["REQ-003"],
    tags: ["login", "ios", "regresion"],
  },
  {
    key: "TC-011",
    suite: "TS-03",
    module: "Autenticación",
    title: "Bloqueo de cuenta tras 3 intentos fallidos",
    preconditions: "Usuario activo sin intentos fallidos previos.",
    steps: [
      {
        action: "Intentar iniciar sesión 3 veces con contraseña incorrecta",
        expectedResult:
          "Al tercer intento se muestra «Tu cuenta fue bloqueada»",
      },
      {
        action: "Intentar iniciar sesión con la contraseña correcta",
        expectedResult:
          "Se mantiene el bloqueo y se ofrece «Desbloquear cuenta»",
      },
    ],
    priority: "media",
    platform: "web",
    testType: "funcional",
    reviewStatus: "aprobado",
    author: "ludwig",
    requirements: ["REQ-003"],
    tags: ["login"],
  },
  {
    key: "TC-012",
    suite: "TS-03",
    module: "Pagos",
    title: "Flujo completo en Android: inicio de sesión y pago SPEI",
    preconditions: "App instalada en Android 16. Usuario con saldo suficiente.",
    steps: [
      LOGIN_STEP,
      {
        action:
          "Ir a Pagos › Transferencia SPEI y capturar CLABE válida y $500.00",
        expectedResult: "Se muestra el resumen de la operación",
      },
      {
        action: "Confirmar con el token",
        expectedResult: "Se muestra el comprobante con clave de rastreo",
      },
    ],
    priority: "alta",
    platform: "android",
    testType: "regresion",
    reviewStatus: "pendiente_revision",
    author: "ema",
    requirements: ["REQ-001", "REQ-003"],
    tags: ["pagos", "spei", "login", "regresion"],
  },
];

async function seedDeimanTestManager(
  projectId: string,
  userId: (key: UserKey) => string,
  counters: KeyCounterTracker,
) {
  const numberOf = (key: string) => Number(key.split("-").at(-1));

  // Módulos y plataformas
  const moduleIds = new Map<string, string>();
  for (const name of ["Pagos", "Autenticación"]) {
    const { id } = await db.projectModule.upsert({
      where: { projectId_name: { projectId, name } },
      create: { projectId, name },
      update: {},
    });
    moduleIds.set(name, id);
  }
  for (const platform of ["web", "ios", "android"] as const) {
    await db.projectPlatform.upsert({
      where: { projectId_platform: { projectId, platform } },
      create: { projectId, platform },
      update: {},
    });
  }

  // Requerimientos
  const requirements = [
    {
      key: "REQ-001",
      title: "Pago de servicios con transferencia SPEI",
      status: "aprobado",
    },
    {
      key: "REQ-002",
      title: "Pago con tarjeta de crédito o débito",
      status: "aprobado",
    },
    {
      key: "REQ-003",
      title: "Inicio de sesión en la app móvil",
      status: "listo",
    },
  ] as const;
  const requirementIds = new Map<string, string>();
  for (const requirement of requirements) {
    const { key, ...data } = requirement;
    const { id } = await db.requirement.upsert({
      where: { projectId_key: { projectId, key } },
      create: { projectId, key, ...data },
      update: data,
    });
    requirementIds.set(key, id);
    counters.track(projectId, "REQ", numberOf(key));
  }

  // Planes y suites
  const plans = [
    { key: "TP-01", name: "Plan SIT · Flujo de pagos", level: "sit" },
    { key: "TP-02", name: "Plan UAT · Flujo de pagos", level: "uat" },
  ] as const;
  const planIds = new Map<string, string>();
  for (const plan of plans) {
    const { key, ...data } = plan;
    const { id } = await db.testPlan.upsert({
      where: { projectId_key: { projectId, key } },
      create: { projectId, key, ...data },
      update: data,
    });
    planIds.set(key, id);
    counters.track(projectId, "TP", numberOf(key));
  }

  const suites = [
    { key: "TS-01", name: "Pagos SPEI", plan: "TP-01", module: "Pagos" },
    { key: "TS-02", name: "Pagos con tarjeta", plan: "TP-01", module: "Pagos" },
    {
      key: "TS-03",
      name: "UAT · Inicio de sesión y pago",
      plan: "TP-02",
      module: "Autenticación",
    },
  ] as const;
  const suiteIds = new Map<string, string>();
  for (const suite of suites) {
    const data = {
      name: suite.name,
      planId: planIds.get(suite.plan) ?? "",
      moduleId: moduleIds.get(suite.module) ?? null,
    };
    const { id } = await db.testSuite.upsert({
      where: { projectId_key: { projectId, key: suite.key } },
      create: { projectId, key: suite.key, ...data },
      update: data,
    });
    suiteIds.set(suite.key, id);
    counters.track(projectId, "TS", numberOf(suite.key));
  }

  // Casos, con sus pasos validados por Zod
  const caseIds = new Map<string, string>();
  for (const testCase of DEIMAN_CASES) {
    const steps = testCaseStepsSchema.parse(testCase.steps);
    const suiteId = suiteIds.get(testCase.suite);
    if (!suiteId) throw new Error(`Suite desconocida: ${testCase.suite}`);
    const data = {
      suiteId,
      moduleId: moduleIds.get(testCase.module) ?? null,
      title: testCase.title,
      preconditions: testCase.preconditions,
      steps,
      testType: testCase.testType,
      platform: testCase.platform,
      priority: testCase.priority,
      automated: Boolean(testCase.automated),
      scriptPath: testCase.automated ?? null,
      reviewStatus: testCase.reviewStatus,
      authorId: userId(testCase.author),
    };
    const { id } = await db.testCase.upsert({
      where: { projectId_key: { projectId, key: testCase.key } },
      create: { projectId, key: testCase.key, ...data },
      update: data,
    });
    caseIds.set(testCase.key, id);
    counters.track(projectId, "TC", numberOf(testCase.key));

    for (const requirementKey of testCase.requirements) {
      const requirementId = requirementIds.get(requirementKey) ?? "";
      await db.requirementTestCase.upsert({
        where: { requirementId_testCaseId: { requirementId, testCaseId: id } },
        create: { requirementId, testCaseId: id },
        update: {},
      });
    }
    for (const name of testCase.tags) {
      const tag = await db.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      });
      await db.testCaseTag.upsert({
        where: { testCaseId_tagId: { testCaseId: id, tagId: tag.id } },
        create: { testCaseId: id, tagId: tag.id },
        update: {},
      });
    }
  }
  const caseId = (key: string) => {
    const id = caseIds.get(key);
    if (!id) throw new Error(`Caso desconocido: ${key}`);
    return id;
  };

  // Ciclo
  const cycleData = {
    planId: planIds.get("TP-02") ?? "",
    name: "Ciclo UAT 1 · Flujo de pagos",
    startDate: day("2026-10-09"),
    endDate: day("2026-10-23"),
    passRateTarget: 90,
    status: "en_curso" as const,
  };
  const cycle = await db.testCycle.upsert({
    where: { projectId_key: { projectId, key: "CY-01" } },
    create: { projectId, key: "CY-01", ...cycleData },
    update: cycleData,
  });
  counters.track(projectId, "CY", 1);

  // Corridas
  type RunCaseSeed = {
    testCase: string;
    result: "sin_ejecutar" | "aprobado" | "fallido" | "bloqueado" | "omitido";
    executedAt?: string;
    durationSeconds?: number;
    notes?: string;
  };
  const runs: {
    key: string;
    data: Omit<Prisma.TestRunUncheckedCreateInput, "projectId" | "key">;
    executor: UserKey;
    cases: RunCaseSeed[];
    currentCase?: string;
  }[] = [
    {
      key: "EJ-001",
      executor: "valeria",
      data: {
        cycleId: cycle.id,
        name: "Regresión de pagos sobre 1.17",
        type: "regresion",
        environment: "uat",
        buildVersion: "1.17",
        status: "completada",
        takenById: userId("valeria"),
        takenAt: at("2026-10-09T15:00:00Z"),
        startedAt: at("2026-10-09T15:05:00Z"),
        finishedAt: at("2026-10-10T22:40:00Z"),
        dueAt: at("2026-10-10T23:59:00Z"),
      },
      cases: [
        {
          testCase: "TC-001",
          result: "fallido",
          executedAt: "2026-10-09T15:20:00Z",
          durationSeconds: 540,
          notes: "La API responde HTTP 500 al confirmar el pago. Ver BUG-101.",
        },
        {
          testCase: "TC-002",
          result: "aprobado",
          executedAt: "2026-10-09T15:35:00Z",
          durationSeconds: 180,
        },
        {
          testCase: "TC-003",
          result: "aprobado",
          executedAt: "2026-10-09T15:50:00Z",
          durationSeconds: 240,
        },
        {
          testCase: "TC-004",
          result: "bloqueado",
          executedAt: "2026-10-09T16:00:00Z",
          notes: "Sin pagos SPEI liquidados por BUG-101.",
        },
        {
          testCase: "TC-005",
          result: "aprobado",
          executedAt: "2026-10-09T16:20:00Z",
          durationSeconds: 150,
        },
        {
          testCase: "TC-006",
          result: "aprobado",
          executedAt: "2026-10-10T15:10:00Z",
          durationSeconds: 420,
        },
        {
          testCase: "TC-007",
          result: "aprobado",
          executedAt: "2026-10-10T15:30:00Z",
          durationSeconds: 200,
        },
        {
          testCase: "TC-008",
          result: "aprobado",
          executedAt: "2026-10-10T15:45:00Z",
          durationSeconds: 210,
        },
        {
          testCase: "TC-009",
          result: "omitido",
          executedAt: "2026-10-10T16:00:00Z",
          notes: "El ambiente no tiene tarjetas de débito guardadas.",
        },
        {
          testCase: "TC-010",
          result: "fallido",
          executedAt: "2026-10-10T20:10:00Z",
          durationSeconds: 300,
          notes:
            "El botón «Iniciar sesión» aparece cortado en iPhone 15. Ver BUG-102.",
        },
        {
          testCase: "TC-011",
          result: "aprobado",
          executedAt: "2026-10-10T21:00:00Z",
          durationSeconds: 260,
        },
        {
          testCase: "TC-012",
          result: "bloqueado",
          executedAt: "2026-10-10T22:30:00Z",
          notes: "Bloqueado por BUG-101 (pago SPEI).",
        },
      ],
    },
    {
      key: "EJ-002",
      executor: "ludwig",
      data: {
        cycleId: cycle.id,
        name: "UAT · Re-test de Login iOS y pagos",
        type: "uat",
        environment: "uat",
        buildVersion: "1.17",
        status: "pausada",
        takenById: userId("ludwig"),
        takenAt: at("2026-10-12T15:00:00Z"),
        startedAt: at("2026-10-12T15:05:00Z"),
        pausedAt: at("2026-10-12T19:30:00Z"),
        dueAt: at("2026-10-16T23:59:00Z"),
      },
      cases: [
        {
          testCase: "TC-011",
          result: "aprobado",
          executedAt: "2026-10-12T15:30:00Z",
          durationSeconds: 240,
        },
        {
          testCase: "TC-006",
          result: "aprobado",
          executedAt: "2026-10-12T17:10:00Z",
          durationSeconds: 380,
        },
        {
          testCase: "TC-007",
          result: "aprobado",
          executedAt: "2026-10-12T19:20:00Z",
          durationSeconds: 190,
        },
        { testCase: "TC-010", result: "sin_ejecutar" },
        { testCase: "TC-001", result: "sin_ejecutar" },
        { testCase: "TC-012", result: "sin_ejecutar" },
      ],
      currentCase: "TC-010",
    },
  ];

  const runCaseIds = new Map<string, string>();
  for (const run of runs) {
    testRunSchema.parse({
      cycleId: run.data.cycleId ?? null,
      type: run.data.type,
      environment: run.data.environment,
      status: run.data.status ?? "borrador",
      buildVersion: run.data.buildVersion ?? null,
      environmentUrl: run.data.environmentUrl ?? null,
      smokeVerdict: run.data.smokeVerdict ?? null,
    });
    const { id: runId } = await db.testRun.upsert({
      where: { projectId_key: { projectId, key: run.key } },
      create: { projectId, key: run.key, ...run.data },
      update: { ...run.data, currentRunCaseId: null },
    });
    counters.track(projectId, "EJ", numberOf(run.key));

    for (const [index, runCase] of run.cases.entries()) {
      const executed = runCase.result !== "sin_ejecutar";
      const data = {
        order: index + 1,
        result: runCase.result,
        executedById: executed ? userId(run.executor) : null,
        executedAt: runCase.executedAt ? at(runCase.executedAt) : null,
        durationSeconds: runCase.durationSeconds ?? null,
        notes: runCase.notes ?? null,
      };
      const testCaseId = caseId(runCase.testCase);
      const { id } = await db.testRunCase.upsert({
        where: { runId_testCaseId: { runId, testCaseId } },
        create: { runId, testCaseId, ...data },
        update: data,
      });
      runCaseIds.set(`${run.key}/${runCase.testCase}`, id);
    }
    if (run.currentCase) {
      await db.testRun.update({
        where: { id: runId },
        data: {
          currentRunCaseId:
            runCaseIds.get(`${run.key}/${run.currentCase}`) ?? null,
        },
      });
    }
  }

  // Defectos registrados (Deiman) del documento de contexto
  const defects: {
    key: string;
    data: Omit<Prisma.DefectUncheckedCreateInput, "projectId" | "key">;
    runCases: string[];
    history: {
      from: DefectStatus | null;
      to: DefectStatus;
      by: UserKey;
      at: string;
      comment?: string;
    }[];
  }[] = [
    {
      key: "BUG-101",
      data: {
        title: "Error 500 en pago SPEI",
        description:
          "Al confirmar una transferencia SPEI con token, la API de pagos responde HTTP 500.",
        stepsToReproduce:
          "1. Iniciar sesión con qa.pagos.\n2. Pagos › Transferencia SPEI.\n3. CLABE 002180700112345678, monto $1,500.00.\n4. Confirmar con el token.",
        expectedResult:
          "Se muestra el comprobante con folio y clave de rastreo.",
        actualResult:
          "Se muestra «Ocurrió un error» y la API responde HTTP 500; no se registra el pago.",
        severity: "critica",
        priority: "alta",
        status: "nuevo",
        origin: "equipo_qa",
        platform: "web",
        moduleId: moduleIds.get("Pagos") ?? null,
        environment: "uat",
        rootCause: "logica_codigo",
        injectedPhase: "desarrollo",
        detectedPhase: "uat",
        assigneeId: userId("devBackend"),
        reporterId: userId("valeria"),
        createdAt: at("2026-10-09T15:25:00Z"),
      },
      runCases: ["EJ-001/TC-001"],
      history: [
        { from: null, to: "nuevo", by: "valeria", at: "2026-10-09T15:25:00Z" },
      ],
    },
    {
      key: "BUG-102",
      data: {
        title: "El botón de Login se corta en iOS",
        description:
          "En iPhone 15 (iOS 26) el botón «Iniciar sesión» se muestra cortado por la parte inferior.",
        stepsToReproduce:
          "1. Abrir la app en iPhone 15 con iOS 26.\n2. Observar la pantalla de inicio de sesión.",
        expectedResult: "El botón se ve completo y es tocable.",
        actualResult: "La mitad inferior del botón queda fuera de la pantalla.",
        severity: "baja",
        priority: "media",
        status: "re_test",
        origin: "equipo_qa",
        platform: "ios",
        moduleId: moduleIds.get("Autenticación") ?? null,
        environment: "uat",
        rootCause: "diseno",
        injectedPhase: "diseno",
        detectedPhase: "uat",
        assigneeId: userId("devFront"),
        reporterId: userId("valeria"),
        firstResponseAt: at("2026-10-11T00:30:00Z"),
        resolvedAt: at("2026-10-11T21:00:00Z"),
        createdAt: at("2026-10-10T20:15:00Z"),
      },
      runCases: ["EJ-001/TC-010"],
      history: [
        { from: null, to: "nuevo", by: "valeria", at: "2026-10-10T20:15:00Z" },
        {
          from: "nuevo",
          to: "asignado",
          by: "edith",
          at: "2026-10-11T00:30:00Z",
        },
        {
          from: "asignado",
          to: "en_curso",
          by: "devFront",
          at: "2026-10-11T15:00:00Z",
        },
        {
          from: "en_curso",
          to: "re_test",
          by: "devFront",
          at: "2026-10-11T21:00:00Z",
          comment: "Se ajustó el área segura del layout. Listo para re-test.",
        },
      ],
    },
  ];

  for (const defect of defects) {
    const { id } = await db.defect.upsert({
      where: { projectId_key: { projectId, key: defect.key } },
      create: { projectId, key: defect.key, ...defect.data },
      update: defect.data,
    });
    counters.track(projectId, "BUG", numberOf(defect.key));

    for (const runCaseKey of defect.runCases) {
      const runCaseId = runCaseIds.get(runCaseKey);
      if (!runCaseId) throw new Error(`Resultado desconocido: ${runCaseKey}`);
      await db.defectRunCase.upsert({
        where: { defectId_runCaseId: { defectId: id, runCaseId } },
        create: { defectId: id, runCaseId },
        update: {},
      });
    }
    // El historial no tiene clave natural: se reemplaza completo para ser idempotente
    await db.defectHistory.deleteMany({ where: { defectId: id } });
    await db.defectHistory.createMany({
      data: defect.history.map((entry) => ({
        defectId: id,
        fromStatus: entry.from,
        toStatus: entry.to,
        changedById: userId(entry.by),
        changedAt: at(entry.at),
        comment: entry.comment ?? null,
      })),
    });
  }
}

// ─────────────────────────── Contadores de clave ───────────────────────────

class KeyCounterTracker {
  private readonly max = new Map<
    string,
    { projectId: string; prefix: KeyPrefix; value: number }
  >();

  track(projectId: string, prefix: KeyPrefix, value: number) {
    const id = `${projectId}:${prefix}`;
    const current = this.max.get(id)?.value ?? 0;
    this.max.set(id, { projectId, prefix, value: Math.max(current, value) });
  }

  /** Nunca baja un contador: si la app ya generó claves mayores, se respetan. */
  async persist() {
    for (const { projectId, prefix, value } of this.max.values()) {
      const where = { projectId_prefix: { projectId, prefix } };
      const existing = await db.keyCounter.findUnique({ where });
      if (!existing) {
        await db.keyCounter.create({
          data: { projectId, prefix, lastValue: value },
        });
      } else if (existing.lastValue < value) {
        await db.keyCounter.update({ where, data: { lastValue: value } });
      }
    }
  }
}

// ─────────────────────────────── Main ───────────────────────────────

async function main() {
  const counters = new KeyCounterTracker();
  const roleIds = await seedRolesAndPermissions();
  const userId = await seedUsers();
  const projectId = await seedProjects(userId, roleIds);
  await seedDeploymentsAndScopeChanges(projectId);
  await seedPortfolioOpenDefects(projectId, counters);
  await seedDeimanTestManager(projectId("DEI"), userId, counters);
  await counters.persist();

  const [users, projects, testCases, defects] = await Promise.all([
    db.user.count(),
    db.project.count(),
    db.testCase.count(),
    db.defect.count(),
  ]);
  console.log(
    `✓ Seed: ${users} personas, ${projects} proyectos, ${testCases} casos, ${defects} defectos`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
