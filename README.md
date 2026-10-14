# BluePixel · QA Center

Hub central de calidad de BluePixel, en evolución hacia la plataforma multi-proyecto **QA Center + Test Manager**.
La primera sección es el **mapa interactivo del proceso de QA** (fases, quality gates, ciclo de vida de defectos,
roles, KPIs y escalamiento) basado en los SOP-QA-001 a SOP-QA-009.

> El proyecto se está migrando por pasos desde un sitio estático a Next.js. La versión estática original
> se conserva en [`legacy/`](legacy/) como referencia de contenido, textos y comportamiento.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React
- TypeScript en modo estricto
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- ESLint + Prettier (con `prettier-plugin-tailwindcss`)
- MySQL 8.4 + [Prisma](https://www.prisma.io) 7
- Vitest para pruebas unitarias

## Ejecutar en local

Requiere Node.js 24 (ver `.nvmrc`; con nvm: `nvm use`) y MySQL 8.4 local
(`brew install mysql@8.4 && brew services start mysql@8.4`). La creación del usuario
y de las bases está en [CLAUDE.md › Base de datos](CLAUDE.md#base-de-datos).

```bash
cp .env.example .env   # pon la clave real del usuario de MySQL
npm install            # también genera el cliente de Prisma
npm run db:reset       # crea las tablas y carga los datos de ejemplo
npm run dev
```

Abre `http://localhost:3000`: la página de inicio lista el portafolio desde MySQL.

| Script                 | Descripción                                 |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                      |
| `npm run build`        | Build de producción (no necesita MySQL)     |
| `npm run start`        | Sirve el build de producción                |
| `npm run lint`         | ESLint                                      |
| `npm run typecheck`    | Genera tipos de rutas y corre `tsc`         |
| `npm test`             | Pruebas unitarias (Vitest)                  |
| `npm run format`       | Formatea con Prettier                       |
| `npm run format:check` | Verifica el formato                         |
| `npm run check:focus`  | Falla si hay anillos de foco translúcidos   |
| `npm run db:migrate`   | Crea y aplica migraciones                   |
| `npm run db:seed`      | Carga los datos de ejemplo (idempotente)    |
| `npm run db:reset`     | Borra, migra y siembra (solo en desarrollo) |
| `npm run db:studio`    | Prisma Studio                               |

La versión estática original puede verse con `npx serve legacy`.

## Estructura

```
.
├── legacy/                   # Sitio estático original (referencia, no se modifica)
├── src/
│   ├── app/                  # Rutas: "/", "/proceso" y "/estilos" (solo desarrollo)
│   ├── components/
│   │   ├── ui/               # Componentes shadcn/ui (generados)
│   │   ├── layout/           # Nav, footer, theme toggle
│   │   └── qa/               # StatusBadge
│   ├── features/
│   │   ├── portfolio/        # Portafolio y lógica de riesgo
│   │   └── proceso-qa/       # components/, data/, lib/, types.ts
│   ├── lib/                  # Utilidades compartidas (cn, etc.)
│   └── server/               # Acceso a datos: único lugar que toca Prisma
├── prisma/                   # Esquema, migraciones y seed
├── .github/workflows/ci.yml  # Validación, lint, pruebas, formato y build en cada push/PR a main
└── CLAUDE.md                 # Reglas del proyecto
```

## Integración continua

Cada `push` y `pull_request` a `main` ejecuta, con Node 24 (versión de `.nvmrc`): `npm ci` (genera el cliente de Prisma), `prisma validate`, lint, `check:focus`, typecheck, pruebas, `format:check` y build. Ningún paso necesita MySQL.

## Convención de commits

| Prefijo     | Uso                                   |
| ----------- | ------------------------------------- |
| `feat:`     | Nueva funcionalidad                   |
| `fix:`      | Corrección de defecto                 |
| `docs:`     | Documentación                         |
| `style:`    | Cambios visuales sin lógica           |
| `refactor:` | Reestructuración sin cambio funcional |
| `chore:`    | Configuración, dependencias           |

## Fuente

SOP-QA-001 a SOP-QA-009 de BluePixel, versión 0.1, en vigor desde el 29-jul-2026.
