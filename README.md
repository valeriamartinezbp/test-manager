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
- Próximamente: Prisma + MySQL

## Ejecutar en local

Requiere Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

| Script                 | Descripción                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Servidor de desarrollo              |
| `npm run build`        | Build de producción                 |
| `npm run start`        | Sirve el build de producción        |
| `npm run lint`         | ESLint                              |
| `npm run typecheck`    | Genera tipos de rutas y corre `tsc` |
| `npm run format`       | Formatea con Prettier               |
| `npm run format:check` | Verifica el formato                 |

La versión estática original puede verse con `npx serve legacy`.

## Estructura

```
.
├── legacy/                   # Sitio estático original (referencia, no se modifica)
├── src/
│   ├── app/                  # Rutas: "/" y "/proceso"
│   ├── components/
│   │   ├── ui/               # Componentes shadcn/ui (generados)
│   │   └── layout/           # Nav, footer, theme toggle
│   ├── features/
│   │   └── proceso-qa/       # components/, data/, lib/, types.ts
│   ├── lib/                  # Utilidades compartidas (cn, etc.)
│   └── server/               # Acceso a datos (Prisma)
├── .github/workflows/ci.yml  # Lint, typecheck, formato y build en cada push/PR a main
└── CLAUDE.md                 # Reglas del proyecto
```

## Integración continua

Cada `push` y `pull_request` a `main` ejecuta `npm ci`, lint, typecheck, `format:check` y build con Node 20.

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
