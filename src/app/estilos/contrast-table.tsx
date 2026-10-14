"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QA_TOKENS } from "@/lib/qa-status";
import { cn } from "@/lib/utils";

// WCAG: 4.5:1 para texto (1.4.3) y 3:1 para indicadores de foco (1.4.11).
const MIN_TEXT_RATIO = 4.5;
const MIN_FOCUS_RATIO = 3;

type Theme = "light" | "dark";

type ContrastPair = {
  group: "Tema" | "Semántico" | "Foco" | "Halo";
  label: string;
  foreground: string;
  background: string;
  min: number;
};

type ContrastRow = ContrastPair & Partial<Record<Theme, number>>;

const pairOf = (
  group: ContrastPair["group"],
  foreground: string,
  background: string,
  min: number,
): ContrastPair => ({
  group,
  label: `--${foreground}`,
  foreground,
  background,
  min,
});

const themePairs = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "background"],
  ["destructive-foreground", "destructive"],
  ["sidebar-foreground", "sidebar"],
  ["sidebar-primary-foreground", "sidebar-primary"],
  ["sidebar-accent-foreground", "sidebar-accent"],
].map(([foreground = "", background = ""]) =>
  pairOf("Tema", foreground, background, MIN_TEXT_RATIO),
);

// Por token: texto sobre el sólido, sólido como texto sobre su fondo suave (badges)
// y sólido como texto sobre el fondo de página.
const semanticPairs = QA_TOKENS.flatMap((token) => [
  pairOf("Semántico", `${token}-foreground`, token, MIN_TEXT_RATIO),
  pairOf("Semántico", token, `${token}-subtle`, MIN_TEXT_RATIO),
  pairOf("Semántico", token, "background", MIN_TEXT_RATIO),
]);

const focusPairs = ["background", "card"].map((background) =>
  pairOf("Foco", "ring", background, MIN_FOCUS_RATIO),
);

const staticPairs = [...themePairs, ...semanticPairs, ...focusPairs];

/* ---------- Medición de color ---------- */

function luminanceOf(context: CanvasRenderingContext2D) {
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  const [lr = 0, lg = 0, lb = 0] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** Luminancia de `color` pintado con `alpha` sobre `backdrop`. */
function paint(
  context: CanvasRenderingContext2D,
  color: string,
  backdrop = "#000",
  alpha = 1,
) {
  context.globalAlpha = 1;
  context.fillStyle = "#000";
  context.fillStyle = backdrop;
  context.fillRect(0, 0, 1, 1);
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  context.globalAlpha = 1;
  return luminanceOf(context);
}

const contrastRatio = (a: number, b: number) =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/* ---------- Halo de foco real de los componentes ---------- */

/** Separa `variante:variante:utilidad` sin cortar dentro de [] ni (). */
function splitVariants(className: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of className) {
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
  return { variants: parts.slice(0, -1), utility: parts.at(-1) ?? "" };
}

type FocusRing = { token: string; alpha: number };

/**
 * Color del anillo `focus-visible:ring-*` que aplica en el tema y estado dados.
 * Gana la clase más específica (más variantes); en empate, la última.
 */
function focusRingOf(
  className: string,
  theme: Theme,
  invalid: boolean,
  isColorToken: (token: string) => boolean,
): FocusRing | null {
  const allowed = new Set(["focus-visible"]);
  if (theme === "dark") allowed.add("dark");
  if (invalid) allowed.add("aria-invalid");

  let best: (FocusRing & { specificity: number }) | null = null;
  for (const candidate of className.split(/\s+/)) {
    const { variants, utility } = splitVariants(candidate);
    if (!variants.includes("focus-visible")) continue;
    if (!variants.every((variant) => allowed.has(variant))) continue;
    const match = /^ring-([a-z][\w-]*?)(?:\/(\d+))?$/.exec(utility);
    const token = match?.[1];
    if (!token || !isColorToken(token)) continue;
    const specificity = variants.length;
    if (!best || specificity >= best.specificity) {
      best = { token, alpha: Number(match[2] ?? 100) / 100, specificity };
    }
  }
  return best;
}

/* ---------- Componente ---------- */

export function ContrastTable() {
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const probesRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<ContrastRow[]>(staticPairs);
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    const scopes = { light: lightRef.current, dark: darkRef.current };
    const probes = probesRef.current;
    const context = document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
    if (!scopes.light || !scopes.dark || !probes || !context) return;

    const styles = {
      light: getComputedStyle(scopes.light),
      dark: getComputedStyle(scopes.dark),
    };
    const tokenValue = (theme: Theme, token: string) =>
      styles[theme].getPropertyValue(`--${token}`).trim();

    const frame = requestAnimationFrame(() => {
      const measuredStatic = staticPairs.map((pair) => {
        const ratioIn = (theme: Theme) =>
          contrastRatio(
            paint(context, tokenValue(theme, pair.foreground)),
            paint(context, tokenValue(theme, pair.background)),
          );
        return { ...pair, light: ratioIn("light"), dark: ratioIn("dark") };
      });

      const haloRows: ContrastRow[] = [];
      for (const probe of probes.querySelectorAll<HTMLElement>(
        "[data-probe]",
      )) {
        const className = probe.getAttribute("class") ?? "";
        const name = probe.dataset.probe ?? "";
        const states = className.includes("aria-invalid:")
          ? [false, true]
          : [false];
        for (const invalid of states) {
          for (const background of ["background", "card"]) {
            const row: ContrastRow = {
              group: "Halo",
              label: `${name}${invalid ? " · aria-invalid" : ""}`,
              foreground: "",
              background,
              min: MIN_FOCUS_RATIO,
            };
            for (const theme of ["light", "dark"] as const) {
              const ring = focusRingOf(className, theme, invalid, (token) =>
                Boolean(tokenValue(theme, token)),
              );
              if (!ring) continue;
              const backdrop = tokenValue(theme, background);
              row.foreground = `${ring.token}${ring.alpha < 1 ? `/${ring.alpha * 100}` : ""}`;
              row[theme] = contrastRatio(
                paint(
                  context,
                  tokenValue(theme, ring.token),
                  backdrop,
                  ring.alpha,
                ),
                paint(context, backdrop),
              );
            }
            haloRows.push(row);
          }
        }
      }

      setRows([...measuredStatic, ...haloRows]);
      setMeasured(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Tras medir, un valor ausente es un halo sin anillo de foco: cuenta como falla.
  const failures = rows.filter(
    (row) => (row.light ?? 0) < row.min || (row.dark ?? 0) < row.min,
  ).length;

  return (
    <div className="flex flex-col gap-3">
      <div ref={lightRef} className="light hidden" aria-hidden="true" />
      <div ref={darkRef} className="dark hidden" aria-hidden="true" />
      {/* Componentes reales: su className final define el halo que se mide. */}
      <div ref={probesRef} className="hidden" aria-hidden="true">
        <Button data-probe="Button" tabIndex={-1}>
          x
        </Button>
        <Button
          data-probe="Button destructive"
          variant="destructive"
          tabIndex={-1}
        >
          x
        </Button>
        <Badge data-probe="Badge">x</Badge>
        <Badge data-probe="Badge destructive" variant="destructive">
          x
        </Badge>
        <Checkbox data-probe="Checkbox" tabIndex={-1} />
        <Tabs defaultValue="probe">
          <TabsList>
            <TabsTrigger data-probe="TabsTrigger" value="probe" tabIndex={-1}>
              x
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {measured
          ? `${rows.length} pares medidos · ${failures} por debajo del mínimo en algún tema (texto ${MIN_TEXT_RATIO}:1, foco ${MIN_FOCUS_RATIO}:1)`
          : "Calculando contraste…"}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Grupo</TableHead>
            <TableHead>Texto / indicador</TableHead>
            <TableHead>Color medido</TableHead>
            <TableHead>Fondo</TableHead>
            <TableHead className="text-right">Mínimo</TableHead>
            <TableHead className="text-right">Claro</TableHead>
            <TableHead className="text-right">Oscuro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.group}:${row.label}/${row.background}`}>
              <TableCell className="text-muted-foreground">
                {row.group}
              </TableCell>
              <TableCell className="text-xs">{row.label}</TableCell>
              <TableCell className="font-mono text-xs">
                {row.foreground ? `--${row.foreground}` : "—"}
              </TableCell>
              <TableCell className="font-mono text-xs">
                --{row.background}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {row.min}:1
              </TableCell>
              <RatioCell value={row.light} min={row.min} measured={measured} />
              <RatioCell value={row.dark} min={row.min} measured={measured} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RatioCell({
  value,
  min,
  measured,
}: {
  value: number | undefined;
  min: number;
  measured: boolean;
}) {
  if (value === undefined) {
    return (
      <TableCell
        className={cn(
          "text-right",
          measured && "bg-status-critical-subtle text-status-critical",
        )}
      >
        {measured ? "✗ sin anillo de foco" : "—"}
      </TableCell>
    );
  }
  const passes = value >= min;
  return (
    <TableCell
      className={cn(
        "text-right font-medium",
        passes
          ? "text-status-good"
          : "bg-status-critical-subtle text-status-critical",
      )}
    >
      {value.toFixed(2)}:1 {passes ? "✓" : "✗ no pasa"}
    </TableCell>
  );
}
