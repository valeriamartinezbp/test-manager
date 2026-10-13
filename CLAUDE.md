@AGENTS.md

# BluePixel · QA Center + Test Manager

Plataforma multi-proyecto de gestión de calidad. Se está migrando **por pasos** desde el sitio estático
de `legacy/` (mapa interactivo del proceso de QA, SOP-QA-001 a SOP-QA-009).

## Stack

- Next.js (App Router), React, TypeScript estricto, Tailwind CSS v4, shadcn/ui (preset `base-nova`, sobre Base UI).
- Más adelante: Prisma + MySQL (paso 3).
- npm como gestor de paquetes. Node 24 (`.nvmrc`; usa `nvm use`).

## Reglas

- **Idioma**: identificadores de código (variables, funciones, tipos, archivos de componentes) en inglés;
  todo texto visible en la UI en español. El documento usa `lang="es"`.
- **Tipado**: prohibido `any` y `@ts-ignore` (tampoco `@ts-expect-error` para silenciar errores).
  Todo dato externo (API, formularios, base de datos, query params, JSON) se valida con **Zod**.
- **Componentes**: Server Components por defecto; `"use client"` solo en componentes con interactividad
  (estado, efectos, eventos del navegador), y lo más abajo posible en el árbol.
- **Datos**: el acceso a datos vive solo en `src/server/`. Los componentes nunca consultan la base de datos directamente.
- **Estilos**: colores solo mediante tokens del tema (`bg-background`, `text-muted-foreground`, `border-border`, etc.,
  definidos en `src/app/globals.css`). Nada de valores hex sueltos ni colores arbitrarios en componentes.
- **Accesibilidad obligatoria**: navegación completa con teclado, `aria-label` donde no haya texto visible,
  estilos `focus-visible` en todo elemento interactivo y respeto a `prefers-reduced-motion`
  (variantes `motion-safe:` / `motion-reduce:`).
- **Paridad con legacy**: `legacy/` es la referencia. No inventar textos ni datos; copiarlos de
  `legacy/assets/js/app.js` y `legacy/index.html`. No modificar nada dentro de `legacy/`.
- **shadcn/ui**: los componentes de `src/components/ui/` se generan con `npx shadcn@latest add <componente>`;
  no editarlos a mano salvo que sea imprescindible. Están excluidos de Prettier.
  - Usa el preset **base-nova sobre Base UI, no Radix**: **no existe `asChild`**. Para componer, usa la prop
    `render` (p. ej. `<TooltipTrigger render={<Button variant="outline" />}>`) o aplica `buttonVariants()`
    a otro elemento (p. ej. un `<Link>`).
  - La utilidad `cn` viene del paquete oficial **`cn`** (de shadcn, reemplaza clsx + tailwind-merge);
    `src/lib/utils.ts` solo la reexporta.
- **Tema**: `next-themes` con la clase `.dark` en `<html>` (clave de localStorage `qa-theme`, la misma del legacy).
  El render de un componente nunca debe depender del tema en el servidor; si hace falta, léelo tras montar.
- **Definición de terminado**: cada paso termina con `npm run lint`, `npm run typecheck` y `npm run build` en verde
  (CI además ejecuta `npm run format:check`).

## Tokens de diseño

Definidos en `src/app/globals.css` (`:root` para claro, `.dark` para oscuro) con los valores de
`legacy/assets/css/styles.css`. **Usa siempre estas clases; nunca hex, `rgb()` ni colores de la paleta
por defecto de Tailwind (`blue-500`, `slate-100`…) en componentes.** Las opacidades sobre tokens
(`bg-primary/80`) están permitidas.

| Legacy          | Token actual                                                   | Clase Tailwind                              |
| --------------- | -------------------------------------------------------------- | ------------------------------------------- |
| `--paper`       | `--background`                                                 | `bg-background`                             |
| `--ink`         | `--foreground`, `--card-foreground`, `--popover-foreground`    | `text-foreground`                           |
| `--surface`     | `--card`, `--popover`                                          | `bg-card`, `bg-popover`                     |
| `--muted`       | `--muted-foreground`                                           | `text-muted-foreground`                     |
| _(derivado)_    | `--muted` = 45 % `--line` sobre `--paper`                      | `bg-muted`                                  |
| `--line`        | `--border`, `--input`                                          | `border-border`, `border-input`             |
| `--blue`        | `--primary`, `--ring`                                          | `bg-primary`, `text-primary`, `ring-ring`   |
| `--blue-ink`    | `--primary-foreground`                                         | `text-primary-foreground`                   |
| `--blue-soft`   | `--secondary`, `--accent`, `--blue-soft`                       | `bg-secondary`, `bg-accent`, `bg-blue-soft` |
| `--blue-deep`   | `--secondary-foreground`, `--accent-foreground`, `--blue-deep` | `text-blue-deep`                            |
| `--signal`      | `--signal`                                                     | `bg-signal`, `text-signal`                  |
| `--signal-text` | `--signal-text`                                                | `text-signal-text`                          |
| `--signal-soft` | `--signal-soft`                                                | `bg-signal-soft`                            |
| `--ok`          | `--ok`                                                         | `bg-ok`, `text-ok`                          |
| `--ok-soft`     | `--ok-soft`                                                    | `bg-ok-soft`                                |
| `--bad`         | `--destructive`, `--bad`                                       | `bg-destructive`, `text-bad`                |
| `--bad-soft`    | `--bad-soft`                                                   | `bg-bad-soft`                               |
| `--navy`        | `--navy`                                                       | `bg-navy`                                   |
| `--on-navy`     | `--on-navy`                                                    | `text-on-navy`                              |
| `--grid`        | `--grid`                                                       | `bg-grid` (cuadrícula del `body`)           |
| `--display`     | `--font-display`                                               | `font-display` (h1–h3 lo usan por defecto)  |
| `--body`        | `--font-sans`                                                  | `font-sans` (por defecto en `body`)         |
| `--r-sm` 8px    | `--radius-sm`                                                  | `rounded-sm`                                |
| `--r-md` 12px   | `--radius-md`, `--radius`                                      | `rounded-md`                                |
| `--r-lg` 20px   | `--radius-lg`, `--radius-xl`                                   | `rounded-lg` (paneles), `rounded-xl` (Card) |
| `.code`         | utilidad `code`                                                | `code`                                      |

Derivados sin equivalente legacy: `--chart-1..5` (primary, signal, ok, bad, muted-foreground) y
`--sidebar-*` (card, foreground, primary, accent, border, ring). Para revisar la paleta en vivo:
`/estilos` (solo en desarrollo).

## Estructura de carpetas

```
src/
├── app/                      # Rutas (App Router): layouts, páginas, metadata
├── components/
│   ├── ui/                   # shadcn/ui (generado)
│   └── layout/               # Nav, footer, theme toggle
├── features/
│   └── proceso-qa/           # Mapa del proceso de QA
│       ├── components/       # Componentes propios de la feature
│       ├── data/             # Datos estáticos copiados de legacy/
│       ├── lib/              # Lógica pura de la feature
│       └── types.ts          # Tipos del dominio
├── lib/                      # Utilidades compartidas (cn, etc.)
└── server/                   # Acceso a datos (Prisma irá aquí en el paso 3)
```

Cada nueva funcionalidad va en su propia carpeta dentro de `src/features/` con la misma forma.
Las rutas en `src/app/` son delgadas: componen piezas de `features/` y `components/`.

## Comandos

- `npm run dev` · `npm run build` · `npm run start`
- `npm run lint` · `npm run typecheck` (`next typegen && tsc --noEmit`: `next typegen` genera los tipos
  globales de rutas como `LayoutProps`, necesarios en un checkout limpio antes del build)
- `npm run format` · `npm run format:check`
