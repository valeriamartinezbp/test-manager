#!/usr/bin/env node
// Falla si encuentra anillos de foco con opacidad (p. ej. `focus-visible:ring-ring/50`).
// Un halo translúcido no alcanza 3:1 contra el fondo (WCAG 1.4.11); usa colores sólidos.
// Uso: node scripts/check-focus.mjs [directorio …]   (por defecto: src)
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".css",
  ".mdx",
]);
const IGNORED_DIRS = new Set(["node_modules", ".next"]);

// Utilidades de color de anillo/contorno con opacidad: ring-ring/50, outline-primary/[0.4]…
const TRANSLUCENT_RING =
  /^(ring|outline|ring-offset)-[a-z][\w-]*\/(\d+|\[[^\]]+\])$/;
// El token --ring existe solo para foco: nunca debe usarse translúcido.
const TRANSLUCENT_RING_TOKEN = /^(ring|outline)-ring\/(\d+|\[[^\]]+\])$/;
const FOCUS_VARIANT = /focus/;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.has(extname(entry.name))) yield path;
  }
}

/** Separa `variante:variante:utilidad` sin cortar dentro de [] ni (). */
function splitVariants(candidate) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const char of candidate) {
    if (char === "[" || char === "(") depth += 1;
    if (char === "]" || char === ")") depth -= 1;
    if (char === ":" && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

function findViolations(line) {
  const violations = [];
  for (const candidate of line.split(/[\s"'`{},;]+/)) {
    if (!candidate.includes("/")) continue;
    const parts = splitVariants(candidate);
    const utility = (parts.pop() ?? "").replace(/^!|!$/g, "");
    const hasFocusVariant = parts.some((variant) =>
      FOCUS_VARIANT.test(variant),
    );
    if (
      TRANSLUCENT_RING_TOKEN.test(utility) ||
      (hasFocusVariant && TRANSLUCENT_RING.test(utility))
    ) {
      violations.push(candidate);
    }
  }
  return violations;
}

const roots = process.argv.slice(2);
const findings = [];
for (const root of roots.length > 0 ? roots : ["src"]) {
  for (const file of walk(root)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        for (const candidate of findViolations(line)) {
          findings.push(
            `${relative(process.cwd(), file)}:${index + 1}  ${candidate}`,
          );
        }
      });
  }
}

if (findings.length > 0) {
  console.error(
    `✗ ${findings.length} anillo(s) de foco con opacidad. Usa un color sólido (p. ej. focus-visible:ring-ring):\n`,
  );
  for (const finding of findings) console.error(`  ${finding}`);
  process.exit(1);
}
console.log("✓ check:focus: sin anillos de foco con opacidad");
