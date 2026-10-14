@AGENTS.md

# BluePixel · QA Center + Test Manager

Plataforma multi-proyecto de gestión de calidad. Se construye **por pasos**. `legacy/` (sitio estático original
con el mapa del proceso de QA, SOP-QA-001 a SOP-QA-009) se conserva **solo como referencia de contenido**;
la identidad visual es morado y naranja.

## Stack

- Next.js (App Router), React, TypeScript estricto, Tailwind CSS v4, shadcn/ui (preset `base-nova`, sobre Base UI).
- Base de datos: MySQL 8.4 + Prisma 7.10 con driver adapter de MariaDB (ver «Base de datos»).
- Pruebas unitarias: Vitest (`*.test.ts` junto al código).
- npm como gestor de paquetes. Node 24 (`.nvmrc`; usa `nvm use`). CI usa la misma versión.

## Reglas

- **Idioma**: identificadores de código (variables, funciones, tipos, archivos de componentes) en inglés;
  todo texto visible en la UI en español. El documento usa `lang="es"`. Excepción: los valores del
  vocabulario de QA (ver abajo) están en español porque son los enums de Prisma.
- **Tipado**: prohibido `any` y `@ts-ignore` (tampoco `@ts-expect-error` para silenciar errores).
  Todo dato externo (API, formularios, base de datos, query params, JSON) se valida con **Zod**.
- **Componentes**: Server Components por defecto; `"use client"` solo en componentes con interactividad
  (estado, efectos, eventos del navegador), y lo más abajo posible en el árbol.
- **Datos**: el acceso a datos vive solo en `src/server/`. **Solo `src/server/` importa Prisma** (`@prisma/*`,
  el cliente generado o `@/server/db`); ESLint lo bloquea en el resto (excepción: los scripts de `prisma/`).
  Los componentes y páginas llaman funciones exportadas por `src/server/` (p. ej. `listPortfolioProjects`) y
  reciben objetos planos con tipos del vocabulario, no modelos de Prisma.
- **Estilos**: colores **solo** mediante las clases de los tokens de la tabla de abajo. Nada de hex, `rgb()`,
  `oklch()` sueltos ni colores de la paleta por defecto de Tailwind (`red-500`, `slate-100`…) en componentes.
  Las opacidades sobre tokens (`bg-primary/80`) están permitidas.
- **Estados de QA**: nunca se comunican solo con color. Usa `<StatusBadge domain value />`
  (`src/components/qa/`), que siempre muestra ícono + texto + color. El morado de marca no se usa para estados.
- **Accesibilidad obligatoria**: navegación completa con teclado, `aria-label` donde no haya texto visible
  (si hay texto visible, el `aria-label` debe contenerlo), `focus-visible` en todo elemento interactivo,
  contraste ≥ 4.5:1 en texto y respeto a `prefers-reduced-motion` (variantes `motion-safe:` / `motion-reduce:`).
- **Contenido de legacy**: no inventar textos ni datos del proceso de QA; copiarlos de
  `legacy/assets/js/app.js` y `legacy/index.html`. No modificar nada dentro de `legacy/`.
- **shadcn/ui**: los componentes de `src/components/ui/` se generan con `npx shadcn@latest add <componente>`;
  no editarlos a mano salvo que sea imprescindible. Están excluidos de Prettier.
  - Usa el preset **base-nova sobre Base UI, no Radix**: **no existe `asChild`**. Para componer, usa la prop
    `render` (p. ej. `<TooltipTrigger render={<Button variant="outline" />}>`) o aplica `buttonVariants()`
    a otro elemento (p. ej. un `<Link>`).
  - La utilidad `cn` viene del paquete oficial **`cn`** (de shadcn, reemplaza clsx + tailwind-merge);
    `src/lib/utils.ts` solo la reexporta.
  - **Componentes modificados a mano** (por accesibilidad del foco; si los regeneras con `shadcn add`,
    vuelve a aplicar estos cambios):
    - `button.tsx`: halo `focus-visible:ring-ring` (antes `/50`); variante `destructive` con
      `focus-visible:ring-destructive` y `focus-visible:border-destructive` sólidos (antes `/20`, `/40`);
      `aria-invalid:focus-visible:ring-destructive` y `dark:aria-invalid:focus-visible:ring-destructive`.
    - `badge.tsx`: lo mismo que `button.tsx` (halo base, variante `destructive` y foco con `aria-invalid`).
    - `checkbox.tsx`: halo `focus-visible:ring-ring` y foco con `aria-invalid` sólido.
    - `tabs.tsx`: halo de `TabsTrigger` `focus-visible:ring-ring`.
    - Se conservan el grosor de shadcn (`ring-3` / `ring-[3px]`) y el anillo de error sin foco
      (`aria-invalid:ring-destructive/20`, `/40` en oscuro): es un indicador de estado, no de foco.
  - **Anillos de foco siempre sólidos**: nunca `ring-ring/50` ni opacidad en `focus*:ring-*` /
    `focus*:outline-*`; un halo translúcido no llega a 3:1. **Después de agregar o regenerar componentes
    con shadcn, corre `npm run check:focus`** (también corre en CI) y revisa el grupo "Halo" de `/estilos`.
- **Tema**: `next-themes` con la clase `.dark` en `<html>`, sigue al sistema por defecto y guarda la elección
  en localStorage (`qa-theme`). El HTML de un componente nunca debe depender del tema en el servidor:
  usa variantes `dark:` de CSS o lee el tema tras montar.
- **Definición de terminado**: cada paso termina con `npm run lint`, `npm run check:focus`, `npm run typecheck`, `npm test`,
  `npm run format:check` y `npm run build` en verde.

## Tokens de diseño

**`src/app/globals.css` es la fuente de verdad de la paleta.** El tema de tweakcn
(`https://tweakcn.com/r/themes/cmv8lzieu000004leg5nv81fm`) fue solo el punto de partida: **no lo reinstales**
con `npx shadcn add`, porque reintroduce sombras con sintaxis inválida, variables que se apuntan a sí mismas
y pares sin contraste. Los cambios de color se hacen a mano en `globals.css`.

Tokens en `:root`/`.light` (claro) y `.dark` (oscuro), expuestos a Tailwind con `@theme inline`.
Revisión visual y tabla de contraste calculada en `/estilos` (solo en desarrollo).

### Marca y base

| Token                                                                                           | Uso                                   | Clases                                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------- |
| `--primary` / `--primary-foreground`                                                            | Morado de marca: acción principal     | `bg-primary`, `text-primary-foreground`     |
| `--secondary` / `--secondary-foreground`                                                        | Naranja de marca                      | `bg-secondary`, `text-secondary-foreground` |
| `--accent` / `--accent-foreground`                                                              | Morado suave (hover, selección)       | `bg-accent`, `text-accent-foreground`       |
| `--ring`                                                                                        | Anillo de foco                        | `ring-ring`, `outline-ring`                 |
| `--background` / `--foreground`                                                                 | Fondo y texto de página               | `bg-background`, `text-foreground`          |
| `--card`, `--popover` (+ `-foreground`)                                                         | Superficies                           | `bg-card`, `bg-popover`                     |
| `--muted` / `--muted-foreground`                                                                | Superficie neutra / texto secundario  | `bg-muted`, `text-muted-foreground`         |
| `--border`, `--input`                                                                           | Bordes                                | `border-border`, `border-input`             |
| `--destructive` / `--destructive-foreground`                                                    | Acciones destructivas (no estados QA) | `bg-destructive`, `text-destructive`        |
| `--chart-1..5`                                                                                  | Series de gráficas                    | `fill-chart-1`, `bg-chart-1`…               |
| `--sidebar-*`                                                                                   | Navegación lateral                    | `bg-sidebar`, `text-sidebar-foreground`…    |
| `--font-sans` Red Hat Display · `--font-mono` JetBrains Mono · `--font-serif` Georgia (sistema) | Tipografía                            | `font-sans`, `font-mono`, `font-serif`      |
| `--radius` 0.375rem (escala `sm`…`4xl` derivada)                                                | Radios                                | `rounded-sm`…`rounded-4xl`                  |
| `--theme-shadow-*`                                                                              | Sombras del tema                      | `shadow-2xs`…`shadow-2xl`                   |
| `--letter-spacing` −0.015em                                                                     | Tracking base                         | `tracking-normal` (y `tight`, `wide`…)      |

Cifras: usa `tabular-nums` en KPIs y columnas numéricas (las `<table>` ya lo aplican por defecto).

Contraste: todos los pares `-foreground`/fondo cumplen ≥ 4.5:1 y `--ring` cumple ≥ 3:1 contra `--background`
y `--card`, en ambos temas. Los textos sobre colores de marca son oscuros donde el blanco no alcanza
(`secondary-foreground` en ambos temas; `primary-foreground` y `sidebar-primary-foreground` en oscuro).
`--destructive` usa texto blanco en ambos temas con el fondo a L 0.58 (mismo tono y croma que tweakcn).
El halo de foco real de Button, Badge, Checkbox y TabsTrigger (normal, `destructive` y `aria-invalid`)
también se mide en `/estilos` (grupo "Halo", ≥ 3:1). Si cambias un color, revisa que la tabla siga en verde.

### Semánticos de QA

Cada token tiene tres variantes: el color sólido (`X`), el texto sobre él (`X-foreground`) y un fondo suave
(`X-subtle`). Para badges: `bg-X-subtle text-X`. Para rellenos: `bg-X text-X-foreground`.
Todos los pares (`X-foreground`/`X`, `X`/`X-subtle`, `X`/`background`) cumplen ≥ 4.5:1 en ambos temas.

| Grupo                                           | Tokens (clase `bg-…`, `text-…`)                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| Resultado de caso                               | `result-not-run`, `result-passed`, `result-failed`, `result-blocked`, `result-skipped` |
| Severidad                                       | `severity-critical`, `severity-high`, `severity-medium`, `severity-low`                |
| Semáforo (SLA, métricas, riesgo, quality gates) | `status-good`, `status-warning`, `status-critical`                                     |
| Estado de corrida                               | `run-draft`, `run-active`, `run-paused`, `run-completed`                               |

Familias de color (primitivas `--qa-*`, no usar directamente): verde 150° (passed, good, completed),
rojo 18° (failed, critical, severity-critical), ámbar 85° (blocked, warning, paused, severity-high),
azul 250° (run-active, severity-medium), cian 215° (skipped), neutro 286° (not-run, draft, severity-low).
El ámbar y el rojo están deliberadamente lejos del naranja de marca (49°).

## Vocabulario de QA

Fuente única: `src/lib/qa-status.ts` (tipos de unión, listas `as const` y mapa etiqueta + ícono lucide + token).
Los valores son los enums de Prisma; no los renombres sin migración. `src/server/vocabulary.ts` hace fallar el
typecheck si un enum de `prisma/schema.prisma` y su lista de `qa-status.ts` dejan de coincidir.

| Dominio (`domain`) | Valor → etiqueta                                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `testResult`       | `sin_ejecutar` Sin ejecutar · `aprobado` Aprobado · `fallido` Fallido · `bloqueado` Bloqueado · `omitido` Omitido                                                                               |
| `severity`         | `critica` Crítica · `alta` Alta · `media` Media · `baja` Baja                                                                                                                                   |
| `defectStatus`     | `nuevo` Nuevo · `asignado` Asignado · `en_curso` En curso · `re_test` Re-test · `cerrado` Cerrado · `reabierto` Reabierto · `diferido` Diferido · `rechazado` Rechazado · `duplicado` Duplicado |
| `runStatus`        | `borrador` Borrador · `en_curso` En curso · `pausada` Pausada · `completada` Completada                                                                                                         |
| `trafficLight`     | `en_meta` En meta · `atencion` Atención · `fuera_de_meta` Fuera de meta                                                                                                                         |
| `riskLevel`        | `alto` Alto (token `status-critical`) · `medio` Medio (`status-warning`) · `bajo` Bajo (`status-good`)                                                                                          |

Sin badge (solo etiqueta, `QA_PHASE_LABELS`): fase QA del proyecto — `planeacion` Planeación · `diseno` Diseño ·
`preparacion_datos` Preparación de datos · `ejecucion` Ejecución de casos · `regresion` Pruebas de regresión ·
`rendimiento` Pruebas de rendimiento · `uat` UAT · `cierre` Cierre.

**Defecto abierto** (`OPEN_DEFECT_STATUSES`): nuevo, asignado, en_curso, re_test, reabierto. No cuentan cerrado,
rechazado, duplicado ni diferido. Los demás enums del esquema (estatus de requerimiento, tipo de corrida, causa
raíz…) recibirán sus etiquetas en `qa-status.ts` cuando una pantalla las muestre.

## Reglas de negocio decididas

- **SLA por severidad** (respuesta / resolución), configurables por proyecto:
  Crítica 4 h / 24 h · Alta 8 h / 72 h · Media 24 h / 120 h · Baja 48 h / 240 h.
- **Semáforo de SLA**: verde (`en_meta`) hasta el 50 % del tiempo; amarillo (`atencion`) hasta el 100 %
  o mientras no haya respuesta; rojo (`fuera_de_meta`) al vencer.
- **Sign-off** bloqueado si el pass rate es menor a 85 %.
- **KPIs (SOP-QA-009)**: tasa de reapertura < 10 % y fuga a producción < 20 %.
- **Criterio para liberar**: 0 defectos críticos abiertos, 0 altos del release y requerimientos en OK ≥ 95 %.
- **Inicio de sesión** solo con cuentas `@bluepixel.mx`.
- **Roles**: QA Manager, Dirección (solo lectura de dashboards), QA Lead, QA Mid, QA Junior, Trainer,
  Desarrollo, Cliente UAT.
- **Defectos**: viven en un módulo propio; la clave de Jira es opcional.
- **Riesgo de proyecto** (`src/features/portfolio/lib/risk.ts`, con pruebas): Alto con 2+ críticos abiertos o
  7+ días de desviación; Medio con 1 crítico, 2+ altos o 2+ días; Bajo en otro caso. El riesgo fijado a mano
  (`Project.manualRisk`) tiene prioridad. Desviación = fecha estimada − fecha compromiso original, en días
  naturales; un adelanto (negativo) no sube el riesgo.

## Base de datos

### Levantar la base local

1. MySQL 8.4 con Homebrew: `brew install mysql@8.4 && brew services start mysql@8.4`.
2. Crear el usuario y las bases (una sola vez, como root):
   ```sql
   CREATE DATABASE qa_center CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   CREATE DATABASE qa_center_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   CREATE USER 'qa_center'@'localhost' IDENTIFIED BY '<clave>';
   GRANT ALL PRIVILEGES ON qa_center.* TO 'qa_center'@'localhost';
   GRANT ALL PRIVILEGES ON qa_center_shadow.* TO 'qa_center'@'localhost';
   ```
3. `cp .env.example .env` y poner la clave real. **La clave solo vive en `.env`** (ignorado por git); nunca en
   `.env.example`, este archivo, el README, el seed ni ningún archivo versionado.
4. `npm install` (genera el cliente) → `npm run db:reset` (migra y siembra) → `npm run dev`.

Variables: `DATABASE_URL` y `SHADOW_DATABASE_URL` (shadow para `migrate dev`), validadas con Zod en
`src/server/env.ts` al primer uso, para que `next build` y CI funcionen sin base de datos.

### Scripts

| Script                | Qué hace                                                                           |
| --------------------- | ---------------------------------------------------------------------------------- |
| `npm run db:migrate`  | `prisma migrate dev`: crea y aplica migraciones a partir del esquema               |
| `npm run db:seed`     | `prisma db seed` (`tsx prisma/seed.ts`): idempotente, se puede correr varias veces |
| `npm run db:reset`    | Borra la base, aplica migraciones y siembra. **Solo en desarrollo**                |
| `npm run db:studio`   | Prisma Studio                                                                      |
| `npm run db:generate` | Regenera el cliente (también corre en `postinstall`)                               |
| `npm run db:validate` | Valida el esquema (corre en CI)                                                    |

### Prisma 7 (diferencias que importan)

- La conexión vive en `prisma.config.ts` (carga `.env` con `dotenv`), no en `schema.prisma`.
- El cliente se genera en `src/server/generated/prisma` (generator `prisma-client`) y se importa de ahí.
- `PrismaClient` exige un driver adapter: `@prisma/adapter-mariadb` (`src/server/create-prisma-client.ts`).
- `migrate dev`/`migrate reset` **ya no** corren el seed ni `generate`: por eso `db:reset` encadena el seed.
- El paquete es ESM (`"type": "module"`) porque el cliente generado usa `import.meta`.
- Prisma bloquea `migrate reset` si lo lanza un agente de IA: pide confirmación explícita del usuario antes.
- Versión fijada en 7.10.0 (CLI, cliente y adapter iguales). El tag `latest` de `prisma` apunta a una 8.0 RC.

### Claves legibles (KeyCounter)

Las claves (`REQ-###`, `TP-##`, `TS-##`, `TC-###`, `CY-##`, `EJ-###`, `BUG-###`) son únicas por proyecto y se
generan con `nextKey(tx, projectId, prefix)` de `src/server/keys.ts`, **siempre dentro de la misma transacción
que crea el registro**. Incrementa `KeyCounter.lastValue` con un `UPDATE` atómico (bloquea la fila hasta el
commit); si el contador no existe lo crea y, si otro proceso se adelantó, reintenta. El seed nunca baja un
contador. Los cambios de alcance (`ScopeChange.key`) son texto libre y no usan contador.

### Decisiones de esquema

- **Fechas**: todo en UTC. El adapter escribe y lee `DATETIME` en UTC y `createdAt` lo pone Prisma (no MySQL,
  que está en hora local). Los campos de solo día usan `@db.Date` y se muestran con `formatDateOnly`
  (`src/lib/format.ts`, en UTC) para que no se recorran un día.
- **Ids** `cuid()`, `createdAt` y `updatedAt` en todos los modelos, incluidas las tablas puente (por eso las
  relaciones muchos a muchos son modelos explícitos: `RequirementTestCase`, `TestCaseTag`, `DefectRunCase`).
- **Roles por proyecto**: no hay rol global; el rol vive en `Membership` (usuario + proyecto). El acceso a
  "Accesos" lo da `User.isOwner`, no un permiso. Overrides puntuales en `MembershipPermissionOverride`.
- **Líder QA** explícito en `Project.qaLeadId` (además de su membresía con rol `qa_lead`).
- **Avance y observaciones** del control de liberaciones en `Project.progressPercent` (Float) y
  `Project.observations`. `uatOpen` indica si el portal UAT está abierto.
- **Reglas que la base no expresa** se validan con Zod en `src/server/schemas/`: corrida con ciclo obligatorio
  salvo exploratoria; smoke con SemVer, URL del ambiente y veredicto al completarse; pasos del caso
  `[{ action, expectedResult }]`.
- **Corrida reanudable**: `TestRun.currentRunCaseId` apunta al resultado (`TestRunCase`) donde se quedó.
- **Fases**: `TestPlan.level` (ui/api/sit/uat); fase de inyección y detección del defecto con `SdlcPhase`.
- **"Solicitado por"** en despliegues y cambios de alcance es texto libre (son áreas o equipos, no personas).
  El impacto de un cambio de alcance reutiliza `RiskLevel`. Despliegue único por proyecto + versión + ambiente.
- **Evidencias**: solo la clave del archivo en almacenamiento externo, tipo MIME y tamaño; ligada a un
  resultado o a un defecto (al menos uno; se valida en la app).
- **Tags** globales (nombre único). **Mejoras** con proyecto opcional (null = mejora general).
- `ProjectSettings.deviationToleranceDays` (3) se guarda pero el riesgo usa los umbrales fijos del negocio.
- Sin tablas de Auth.js: llegan en el paso de autenticación.

### Datos de ejemplo (seed)

Fuente: «QA Center · Contexto del proyecto» (portafolio al 13/10/2026): 7 proyectos con fechas, fase, avance y
observaciones; despliegues; cambios de alcance; BUG-101 y BUG-102 de Deiman. Correos ficticios `@example.com`.

- Los defectos abiertos de Gateway Pagos (4 críticos, 5 altos), App Móvil v2.0 (1 crítico en re-test, 3 altos)
  y Portal Clientes (1 alto) son **sintéticos**: el documento solo da los conteos. Su descripción lo dice.
- Deiman trae datos completos de Test Manager **de ejemplo** (no del documento): 3 requerimientos, 2 planes,
  3 suites, 12 casos de un flujo de pagos, 1 ciclo, EJ-001 completada y EJ-002 pausada a la mitad.
- "Dev Backend" y "Dev Front" (responsables en el documento) son cuentas de equipo con rol `desarrollo`.

## Estructura de carpetas

```
src/
├── app/                      # Rutas (App Router): layouts, páginas, metadata
│   └── estilos/              # Sistema de diseño (solo desarrollo)
├── components/
│   ├── ui/                   # shadcn/ui (generado)
│   ├── layout/               # Nav, footer, ThemeProvider, ThemeToggle
│   └── qa/                   # Componentes compartidos de QA (StatusBadge)
├── features/
│   └── proceso-qa/           # Mapa del proceso de QA
│       ├── components/       # Componentes propios de la feature
│       ├── data/             # Datos estáticos copiados de legacy/
│       ├── lib/              # Lógica pura de la feature
│       └── types.ts          # Tipos del dominio
│   └── portfolio/            # Portafolio: tabla de proyectos y lógica de riesgo (lib/risk.ts)
├── lib/                      # Utilidades compartidas (cn, qa-status, format)
└── server/                   # Acceso a datos: único lugar que toca Prisma
    ├── db.ts                 # Cliente único (singleton en globalThis, `server-only`)
    ├── create-prisma-client.ts  # Fábrica con el adapter de MariaDB (la usa también el seed)
    ├── env.ts                # Variables de entorno validadas con Zod (al primer uso)
    ├── keys.ts               # Claves TC-###, BUG-###… con KeyCounter
    ├── vocabulary.ts         # Candado: enums de Prisma = vocabulario de qa-status
    ├── schemas/              # Zod: pasos de caso, reglas de corrida
    ├── portfolio.ts          # Consultas del portafolio
    └── generated/prisma/     # Cliente generado (gitignored; `prisma generate`)
prisma/
├── schema.prisma             # Esquema (fuente de verdad del modelo de datos)
├── migrations/               # Migraciones versionadas
└── seed.ts                   # Datos de ejemplo idempotentes
```

Cada nueva funcionalidad va en su propia carpeta dentro de `src/features/` con la misma forma.
Las rutas en `src/app/` son delgadas: componen piezas de `features/` y `components/`.

## Comandos

- `npm run dev` · `npm run build` · `npm run start`
- `npm run lint` · `npm run typecheck` (`next typegen && tsc --noEmit`: `next typegen` genera los tipos
  globales de rutas como `LayoutProps`, necesarios en un checkout limpio antes del build)
- `npm run format` · `npm run format:check`
- `npm run check:focus` (`scripts/check-focus.mjs`): falla si hay anillos de foco con opacidad en `src/`
- `npm test` (Vitest) · scripts de base de datos: ver «Base de datos»

## Dependencias

- `shadcn` está en devDependencies: solo se usa como CLI y por el `@import "shadcn/tailwind.css"` que se
  resuelve al compilar.
- **braces** (GHSA-vfj7-8cjw-p6xm, alta): llega por `shadcn` y `eslint-config-next` → `fast-glob` →
  `micromatch`. La advisory afecta a `<=3.0.3` y 3.0.3 es la última versión publicada, así que no hay
  versión corregida para un `overrides`. Solo afecta a herramientas de desarrollo (`npm audit --omit=dev`
  da 0). No uses `npm audit fix --force`: propone downgrades mayores. Revisa de nuevo cuando salga una
  versión corregida y agrega el override entonces.
- **Overrides** (`package.json`) por advisories altas con versión corregida del mismo major:
  - `mariadb` 3.5.4: driver de runtime del adapter (fija 3.4.5; afectadas 3.3.0–3.5.3).
  - `mysql2` 3.24.6: lo trae el CLI de Prisma (fija 3.15.3; afectadas ≤ 3.23.0).
    Si actualizas Prisma, revisa si ya trae versiones corregidas y quita el override.
- **deepmerge-ts** (alta, < 8.0.0): la fija `@prisma/config` (CLI) en 7.1.5; la corrección es un salto de major
  y solo procesa nuestro propio `prisma.config.ts`, así que no se fuerza. `npm audit --omit=dev` la reporta
  porque `prisma` es peer de `@prisma/client`; no llega al runtime de la app.
