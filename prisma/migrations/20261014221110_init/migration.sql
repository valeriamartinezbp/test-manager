-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('activo', 'pendiente', 'suspendido') NOT NULL DEFAULT 'pendiente',
    `isOwner` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `baseRoleId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_key_key`(`key`),
    INDEX `roles_baseRoleId_idx`(`baseRoleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permissions_key_key`(`key`),
    INDEX `permissions_group_idx`(`group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `role_permissions_permissionId_idx`(`permissionId`),
    UNIQUE INDEX `role_permissions_roleId_permissionId_key`(`roleId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memberships` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `memberships_projectId_idx`(`projectId`),
    INDEX `memberships_roleId_idx`(`roleId`),
    UNIQUE INDEX `memberships_userId_projectId_key`(`userId`, `projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membership_permission_overrides` (
    `id` VARCHAR(191) NOT NULL,
    `membershipId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,
    `effect` ENUM('otorgar', 'quitar') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `membership_permission_overrides_permissionId_idx`(`permissionId`),
    UNIQUE INDEX `membership_permission_overrides_membershipId_permissionId_key`(`membershipId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `client` VARCHAR(191) NULL,
    `qaPhase` ENUM('planeacion', 'diseno', 'preparacion_datos', 'ejecucion', 'regresion', 'rendimiento', 'uat', 'cierre') NOT NULL DEFAULT 'planeacion',
    `qaLeadId` VARCHAR(191) NULL,
    `startDate` DATE NULL,
    `estimatedDate` DATE NULL,
    `originalCommitDate` DATE NULL,
    `manualRisk` ENUM('alto', 'medio', 'bajo') NULL,
    `uatOpen` BOOLEAN NOT NULL DEFAULT false,
    `progressPercent` DOUBLE NULL,
    `observations` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `projects_key_key`(`key`),
    INDEX `projects_qaLeadId_idx`(`qaLeadId`),
    INDEX `projects_qaPhase_idx`(`qaPhase`),
    INDEX `projects_estimatedDate_idx`(`estimatedDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_modules` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_modules_projectId_name_key`(`projectId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_platforms` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `platform` ENUM('web', 'ios', 'android', 'api', 'escritorio') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_platforms_projectId_platform_key`(`projectId`, `platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_settings` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `passRateMin` INTEGER NOT NULL DEFAULT 85,
    `reopenRateMax` INTEGER NOT NULL DEFAULT 10,
    `leakageMax` INTEGER NOT NULL DEFAULT 20,
    `requirementsOkMin` INTEGER NOT NULL DEFAULT 95,
    `maxOpenCritical` INTEGER NOT NULL DEFAULT 0,
    `maxOpenHighRelease` INTEGER NOT NULL DEFAULT 0,
    `businessDays` BOOLEAN NOT NULL DEFAULT false,
    `deviationToleranceDays` INTEGER NOT NULL DEFAULT 3,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_settings_projectId_key`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sla_policies` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `severity` ENUM('critica', 'alta', 'media', 'baja') NOT NULL,
    `responseHours` INTEGER NOT NULL,
    `resolutionHours` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sla_policies_projectId_severity_key`(`projectId`, `severity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `custom_metrics` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `formula` TEXT NOT NULL,
    `unit` VARCHAR(191) NULL,
    `betterWhen` ENUM('alto', 'bajo') NOT NULL,
    `greenThreshold` DOUBLE NOT NULL,
    `yellowThreshold` DOUBLE NOT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `custom_metrics_projectId_name_key`(`projectId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requirements` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('borrador', 'aprobado', 'en_desarrollo', 'listo', 'liberado') NOT NULL DEFAULT 'borrador',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `requirements_projectId_status_idx`(`projectId`, `status`),
    UNIQUE INDEX `requirements_projectId_key_key`(`projectId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requirement_test_cases` (
    `id` VARCHAR(191) NOT NULL,
    `requirementId` VARCHAR(191) NOT NULL,
    `testCaseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `requirement_test_cases_testCaseId_idx`(`testCaseId`),
    UNIQUE INDEX `requirement_test_cases_requirementId_testCaseId_key`(`requirementId`, `testCaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_plans` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `level` ENUM('ui', 'api', 'sit', 'uat') NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `test_plans_projectId_key_key`(`projectId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_suites` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `moduleId` VARCHAR(191) NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `test_suites_planId_idx`(`planId`),
    INDEX `test_suites_moduleId_idx`(`moduleId`),
    UNIQUE INDEX `test_suites_projectId_key_key`(`projectId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_cases` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `suiteId` VARCHAR(191) NOT NULL,
    `moduleId` VARCHAR(191) NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `preconditions` TEXT NULL,
    `steps` JSON NOT NULL,
    `testType` ENUM('funcional', 'regresion', 'smoke', 'integracion', 'rendimiento', 'seguridad', 'usabilidad') NOT NULL DEFAULT 'funcional',
    `platform` ENUM('web', 'ios', 'android', 'api', 'escritorio') NULL,
    `priority` ENUM('alta', 'media', 'baja') NOT NULL DEFAULT 'media',
    `automated` BOOLEAN NOT NULL DEFAULT false,
    `scriptPath` VARCHAR(191) NULL,
    `reviewStatus` ENUM('aprobado', 'pendiente_revision', 'devuelto') NOT NULL DEFAULT 'pendiente_revision',
    `authorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `test_cases_suiteId_idx`(`suiteId`),
    INDEX `test_cases_moduleId_idx`(`moduleId`),
    INDEX `test_cases_projectId_reviewStatus_idx`(`projectId`, `reviewStatus`),
    INDEX `test_cases_authorId_idx`(`authorId`),
    UNIQUE INDEX `test_cases_projectId_key_key`(`projectId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_case_tags` (
    `id` VARCHAR(191) NOT NULL,
    `testCaseId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `test_case_tags_tagId_idx`(`tagId`),
    UNIQUE INDEX `test_case_tags_testCaseId_tagId_key`(`testCaseId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_cycles` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATE NULL,
    `endDate` DATE NULL,
    `passRateTarget` INTEGER NULL,
    `status` ENUM('planeado', 'en_curso', 'cerrado') NOT NULL DEFAULT 'planeado',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `test_cycles_planId_idx`(`planId`),
    INDEX `test_cycles_projectId_status_idx`(`projectId`, `status`),
    UNIQUE INDEX `test_cycles_projectId_key_key`(`projectId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_runs` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `cycleId` VARCHAR(191) NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('smoke', 'regresion', 'funcional', 'sanity', 'uat', 'exploratoria') NOT NULL,
    `environment` ENUM('qa', 'sit', 'uat', 'staging', 'produccion') NOT NULL,
    `buildVersion` VARCHAR(191) NULL,
    `status` ENUM('borrador', 'en_curso', 'pausada', 'completada') NOT NULL DEFAULT 'borrador',
    `currentRunCaseId` VARCHAR(191) NULL,
    `takenById` VARCHAR(191) NULL,
    `takenAt` DATETIME(3) NULL,
    `startedAt` DATETIME(3) NULL,
    `pausedAt` DATETIME(3) NULL,
    `finishedAt` DATETIME(3) NULL,
    `dueAt` DATETIME(3) NULL,
    `environmentUrl` VARCHAR(191) NULL,
    `smokeVerdict` ENUM('certificado', 'rechazado') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `test_runs_currentRunCaseId_key`(`currentRunCaseId`),
    INDEX `test_runs_cycleId_idx`(`cycleId`),
    INDEX `test_runs_projectId_status_idx`(`projectId`, `status`),
    INDEX `test_runs_takenById_idx`(`takenById`),
    INDEX `test_runs_dueAt_idx`(`dueAt`),
    UNIQUE INDEX `test_runs_projectId_key_key`(`projectId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_run_cases` (
    `id` VARCHAR(191) NOT NULL,
    `runId` VARCHAR(191) NOT NULL,
    `testCaseId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `result` ENUM('sin_ejecutar', 'aprobado', 'fallido', 'bloqueado', 'omitido') NOT NULL DEFAULT 'sin_ejecutar',
    `executedById` VARCHAR(191) NULL,
    `executedAt` DATETIME(3) NULL,
    `durationSeconds` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `test_run_cases_testCaseId_idx`(`testCaseId`),
    INDEX `test_run_cases_runId_result_idx`(`runId`, `result`),
    INDEX `test_run_cases_executedById_idx`(`executedById`),
    UNIQUE INDEX `test_run_cases_runId_testCaseId_key`(`runId`, `testCaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `defects` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `stepsToReproduce` TEXT NULL,
    `expectedResult` TEXT NULL,
    `actualResult` TEXT NULL,
    `severity` ENUM('critica', 'alta', 'media', 'baja') NOT NULL,
    `priority` ENUM('alta', 'media', 'baja') NOT NULL DEFAULT 'media',
    `status` ENUM('nuevo', 'asignado', 'en_curso', 're_test', 'cerrado', 'reabierto', 'diferido', 'rechazado', 'duplicado') NOT NULL DEFAULT 'nuevo',
    `origin` ENUM('equipo_qa', 'cliente_uat', 'ci', 'agente') NOT NULL DEFAULT 'equipo_qa',
    `platform` ENUM('web', 'ios', 'android', 'api', 'escritorio') NULL,
    `moduleId` VARCHAR(191) NULL,
    `environment` ENUM('qa', 'sit', 'uat', 'staging', 'produccion') NULL,
    `rootCause` ENUM('por_definir', 'requisitos', 'diseno', 'logica_codigo', 'entorno_config', 'datos_migracion', 'integracion_api', 'proceso_cobertura') NOT NULL DEFAULT 'por_definir',
    `injectedPhase` ENUM('requisitos', 'diseno', 'desarrollo', 'ui', 'api', 'sit', 'uat', 'produccion') NULL,
    `detectedPhase` ENUM('requisitos', 'diseno', 'desarrollo', 'ui', 'api', 'sit', 'uat', 'produccion') NULL,
    `foundInProduction` BOOLEAN NOT NULL DEFAULT false,
    `jiraKey` VARCHAR(191) NULL,
    `assigneeId` VARCHAR(191) NULL,
    `reporterId` VARCHAR(191) NULL,
    `releaseId` VARCHAR(191) NULL,
    `firstResponseAt` DATETIME(3) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `reopenCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `defects_projectId_status_idx`(`projectId`, `status`),
    INDEX `defects_projectId_severity_status_idx`(`projectId`, `severity`, `status`),
    INDEX `defects_assigneeId_status_idx`(`assigneeId`, `status`),
    INDEX `defects_reporterId_idx`(`reporterId`),
    INDEX `defects_releaseId_idx`(`releaseId`),
    INDEX `defects_moduleId_idx`(`moduleId`),
    INDEX `defects_createdAt_idx`(`createdAt`),
    UNIQUE INDEX `defects_projectId_key_key`(`projectId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `defect_run_cases` (
    `id` VARCHAR(191) NOT NULL,
    `defectId` VARCHAR(191) NOT NULL,
    `runCaseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `defect_run_cases_runCaseId_idx`(`runCaseId`),
    UNIQUE INDEX `defect_run_cases_defectId_runCaseId_key`(`defectId`, `runCaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `defect_history` (
    `id` VARCHAR(191) NOT NULL,
    `defectId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('nuevo', 'asignado', 'en_curso', 're_test', 'cerrado', 'reabierto', 'diferido', 'rechazado', 'duplicado') NULL,
    `toStatus` ENUM('nuevo', 'asignado', 'en_curso', 're_test', 'cerrado', 'reabierto', 'diferido', 'rechazado', 'duplicado') NOT NULL,
    `changedById` VARCHAR(191) NULL,
    `comment` TEXT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `defect_history_defectId_changedAt_idx`(`defectId`, `changedAt`),
    INDEX `defect_history_changedById_idx`(`changedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `defect_comments` (
    `id` VARCHAR(191) NOT NULL,
    `defectId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `defect_comments_defectId_createdAt_idx`(`defectId`, `createdAt`),
    INDEX `defect_comments_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidence` (
    `id` VARCHAR(191) NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `runCaseId` VARCHAR(191) NULL,
    `defectId` VARCHAR(191) NULL,
    `uploadedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `evidence_storageKey_key`(`storageKey`),
    INDEX `evidence_runCaseId_idx`(`runCaseId`),
    INDEX `evidence_defectId_idx`(`defectId`),
    INDEX `evidence_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `releases` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `type` ENUM('mayor', 'menor', 'parche') NOT NULL,
    `status` ENUM('planeada', 'en_desarrollo', 'en_pruebas', 'lista', 'liberada', 'fallida', 'pospuesta') NOT NULL DEFAULT 'planeada',
    `devStartDate` DATE NULL,
    `plannedDate` DATE NULL,
    `actualDate` DATE NULL,
    `goNoGo` ENUM('go', 'no_go') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `releases_projectId_status_idx`(`projectId`, `status`),
    INDEX `releases_plannedDate_idx`(`plannedDate`),
    UNIQUE INDEX `releases_projectId_version_key`(`projectId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deployments` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `releaseId` VARCHAR(191) NULL,
    `version` VARCHAR(191) NOT NULL,
    `environment` ENUM('qa', 'sit', 'uat', 'staging', 'produccion') NOT NULL,
    `deployedAt` DATETIME(3) NOT NULL,
    `requestedBy` VARCHAR(191) NOT NULL,
    `status` ENUM('exitoso', 'con_errores', 'en_progreso', 'rollback') NOT NULL,
    `prodApproval` ENUM('si', 'no', 'pendiente') NOT NULL DEFAULT 'pendiente',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `deployments_projectId_deployedAt_idx`(`projectId`, `deployedAt`),
    INDEX `deployments_environment_status_idx`(`environment`, `status`),
    INDEX `deployments_releaseId_idx`(`releaseId`),
    UNIQUE INDEX `deployments_projectId_version_environment_key`(`projectId`, `version`, `environment`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scope_changes` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('nueva_funcionalidad', 'mejora', 'correccion', 'cambio_alcance') NOT NULL,
    `status` ENUM('en_analisis', 'aprobado', 'rechazado', 'en_qa', 'liberado') NOT NULL DEFAULT 'en_analisis',
    `requestedAt` DATE NOT NULL,
    `requestedBy` VARCHAR(191) NOT NULL,
    `impact` ENUM('alto', 'medio', 'bajo') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `scope_changes_projectId_status_idx`(`projectId`, `status`),
    INDEX `scope_changes_requestedAt_idx`(`requestedAt`),
    UNIQUE INDEX `scope_changes_projectId_key_key`(`projectId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `type` ENUM('estrategia', 'test_plan', 'informe_cierre', 'acta_signoff', 'otro') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `status` ENUM('borrador', 'en_revision', 'aprobado') NOT NULL DEFAULT 'borrador',
    `version` INTEGER NOT NULL DEFAULT 1,
    `authorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `documents_projectId_type_idx`(`projectId`, `type`),
    INDEX `documents_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_signatures` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `signedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `document_signatures_userId_idx`(`userId`),
    UNIQUE INDEX `document_signatures_documentId_userId_version_key`(`documentId`, `userId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_reports` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `summary` TEXT NOT NULL,
    `metrics` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `daily_reports_projectId_date_idx`(`projectId`, `date`),
    UNIQUE INDEX `daily_reports_userId_projectId_date_key`(`userId`, `projectId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `improvements` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('propuesta', 'en_analisis', 'aprobada', 'en_curso', 'hecha', 'descartada') NOT NULL DEFAULT 'propuesta',
    `area` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NULL,
    `ownerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `improvements_status_idx`(`status`),
    INDEX `improvements_projectId_idx`(`projectId`),
    INDEX `improvements_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `improvement_votes` (
    `id` VARCHAR(191) NOT NULL,
    `improvementId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `improvement_votes_userId_idx`(`userId`),
    UNIQUE INDEX `improvement_votes_improvementId_userId_key`(`improvementId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `detail` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `audit_logs_entity_entityId_idx`(`entity`, `entityId`),
    INDEX `audit_logs_actorId_idx`(`actorId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `key_counters` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `lastValue` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `key_counters_projectId_prefix_key`(`projectId`, `prefix`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_baseRoleId_fkey` FOREIGN KEY (`baseRoleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membership_permission_overrides` ADD CONSTRAINT `membership_permission_overrides_membershipId_fkey` FOREIGN KEY (`membershipId`) REFERENCES `memberships`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membership_permission_overrides` ADD CONSTRAINT `membership_permission_overrides_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_qaLeadId_fkey` FOREIGN KEY (`qaLeadId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_modules` ADD CONSTRAINT `project_modules_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_platforms` ADD CONSTRAINT `project_platforms_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_settings` ADD CONSTRAINT `project_settings_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sla_policies` ADD CONSTRAINT `sla_policies_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `custom_metrics` ADD CONSTRAINT `custom_metrics_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requirements` ADD CONSTRAINT `requirements_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requirement_test_cases` ADD CONSTRAINT `requirement_test_cases_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `requirements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requirement_test_cases` ADD CONSTRAINT `requirement_test_cases_testCaseId_fkey` FOREIGN KEY (`testCaseId`) REFERENCES `test_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_plans` ADD CONSTRAINT `test_plans_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_suites` ADD CONSTRAINT `test_suites_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_suites` ADD CONSTRAINT `test_suites_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `test_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_suites` ADD CONSTRAINT `test_suites_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `project_modules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_cases` ADD CONSTRAINT `test_cases_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_cases` ADD CONSTRAINT `test_cases_suiteId_fkey` FOREIGN KEY (`suiteId`) REFERENCES `test_suites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_cases` ADD CONSTRAINT `test_cases_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `project_modules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_cases` ADD CONSTRAINT `test_cases_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_case_tags` ADD CONSTRAINT `test_case_tags_testCaseId_fkey` FOREIGN KEY (`testCaseId`) REFERENCES `test_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_case_tags` ADD CONSTRAINT `test_case_tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_cycles` ADD CONSTRAINT `test_cycles_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_cycles` ADD CONSTRAINT `test_cycles_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `test_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_runs` ADD CONSTRAINT `test_runs_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_runs` ADD CONSTRAINT `test_runs_cycleId_fkey` FOREIGN KEY (`cycleId`) REFERENCES `test_cycles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_runs` ADD CONSTRAINT `test_runs_currentRunCaseId_fkey` FOREIGN KEY (`currentRunCaseId`) REFERENCES `test_run_cases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_runs` ADD CONSTRAINT `test_runs_takenById_fkey` FOREIGN KEY (`takenById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_run_cases` ADD CONSTRAINT `test_run_cases_runId_fkey` FOREIGN KEY (`runId`) REFERENCES `test_runs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_run_cases` ADD CONSTRAINT `test_run_cases_testCaseId_fkey` FOREIGN KEY (`testCaseId`) REFERENCES `test_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_run_cases` ADD CONSTRAINT `test_run_cases_executedById_fkey` FOREIGN KEY (`executedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defects` ADD CONSTRAINT `defects_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defects` ADD CONSTRAINT `defects_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `project_modules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defects` ADD CONSTRAINT `defects_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defects` ADD CONSTRAINT `defects_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defects` ADD CONSTRAINT `defects_releaseId_fkey` FOREIGN KEY (`releaseId`) REFERENCES `releases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defect_run_cases` ADD CONSTRAINT `defect_run_cases_defectId_fkey` FOREIGN KEY (`defectId`) REFERENCES `defects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defect_run_cases` ADD CONSTRAINT `defect_run_cases_runCaseId_fkey` FOREIGN KEY (`runCaseId`) REFERENCES `test_run_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defect_history` ADD CONSTRAINT `defect_history_defectId_fkey` FOREIGN KEY (`defectId`) REFERENCES `defects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defect_history` ADD CONSTRAINT `defect_history_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defect_comments` ADD CONSTRAINT `defect_comments_defectId_fkey` FOREIGN KEY (`defectId`) REFERENCES `defects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defect_comments` ADD CONSTRAINT `defect_comments_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_runCaseId_fkey` FOREIGN KEY (`runCaseId`) REFERENCES `test_run_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_defectId_fkey` FOREIGN KEY (`defectId`) REFERENCES `defects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `releases` ADD CONSTRAINT `releases_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deployments` ADD CONSTRAINT `deployments_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deployments` ADD CONSTRAINT `deployments_releaseId_fkey` FOREIGN KEY (`releaseId`) REFERENCES `releases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scope_changes` ADD CONSTRAINT `scope_changes_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_signatures` ADD CONSTRAINT `document_signatures_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_signatures` ADD CONSTRAINT `document_signatures_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_reports` ADD CONSTRAINT `daily_reports_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_reports` ADD CONSTRAINT `daily_reports_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `improvements` ADD CONSTRAINT `improvements_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `improvements` ADD CONSTRAINT `improvements_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `improvements` ADD CONSTRAINT `improvements_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `improvement_votes` ADD CONSTRAINT `improvement_votes_improvementId_fkey` FOREIGN KEY (`improvementId`) REFERENCES `improvements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `improvement_votes` ADD CONSTRAINT `improvement_votes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `key_counters` ADD CONSTRAINT `key_counters_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
