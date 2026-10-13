@AGENTS.md

# BluePixel · QA Center + Test Manager

Plataforma multi-proyecto de gestión de calidad. Se está migrando **por pasos** desde el sitio estático
de `legacy/` (mapa interactivo del proceso de QA, SOP-QA-001 a SOP-QA-009).

## Stack

- Next.js (App Router), React, TypeScript estricto, Tailwind CSS v4, shadcn/ui (preset `base-nova`, sobre Base UI).
- Más adelante: Prisma + MySQL (paso 3).
- npm como gestor de paquetes. Node ≥ 20.9.

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
- **Definición de terminado**: cada paso termina con `npm run lint`, `npm run typecheck` y `npm run build` en verde
  (CI además ejecuta `npm run format:check`).

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
- `npm run lint` · `npm run typecheck` (`next typegen && tsc --noEmit`)
- `npm run format` · `npm run format:check`
