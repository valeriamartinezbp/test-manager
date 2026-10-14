"use client";

import { useEffect, useRef, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QA_TOKENS } from "@/lib/qa-status";
import { cn } from "@/lib/utils";

// WCAG: 4.5:1 para texto (1.4.3) y 3:1 para indicadores de foco (1.4.11).
const MIN_TEXT_RATIO = 4.5;
const MIN_FOCUS_RATIO = 3;

type ContrastPair = {
  group: "Tema" | "Semántico" | "Foco";
  foreground: string;
  background: string;
  min: number;
};

const themePairs: ContrastPair[] = [
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
].map(([foreground = "", background = ""]) => ({
  group: "Tema",
  foreground,
  background,
  min: MIN_TEXT_RATIO,
}));

// Por token: texto sobre el sólido, sólido como texto sobre su fondo suave (badges)
// y sólido como texto sobre el fondo de página.
const semanticPairs: ContrastPair[] = QA_TOKENS.flatMap((token) =>
  [
    [`${token}-foreground`, token],
    [token, `${token}-subtle`],
    [token, "background"],
  ].map(([foreground = "", background = ""]) => ({
    group: "Semántico" as const,
    foreground,
    background,
    min: MIN_TEXT_RATIO,
  })),
);

const focusPairs: ContrastPair[] = ["background", "card"].map((background) => ({
  group: "Foco",
  foreground: "ring",
  background,
  min: MIN_FOCUS_RATIO,
}));

const pairs = [...themePairs, ...semanticPairs, ...focusPairs];

type Ratios = { light: number; dark: number };

function relativeLuminance(context: CanvasRenderingContext2D, color: string) {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = "#000";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  const linear = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [lr = 0, lg = 0, lb = 0] = linear;
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(a: number, b: number) {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function measure(
  scope: HTMLElement,
  context: CanvasRenderingContext2D,
  pair: ContrastPair,
) {
  const styles = getComputedStyle(scope);
  const read = (token: string) =>
    relativeLuminance(context, styles.getPropertyValue(`--${token}`).trim());
  return contrastRatio(read(pair.foreground), read(pair.background));
}

export function ContrastTable() {
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const [ratios, setRatios] = useState<Ratios[] | null>(null);

  useEffect(() => {
    const light = lightRef.current;
    const dark = darkRef.current;
    const context = document
      .createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
    if (!light || !dark || !context) return;

    const frame = requestAnimationFrame(() => {
      setRatios(
        pairs.map((pair) => ({
          light: measure(light, context, pair),
          dark: measure(dark, context, pair),
        })),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const failures = ratios?.filter((ratio, index) => {
    const min = pairs[index]?.min ?? MIN_TEXT_RATIO;
    return ratio.light < min || ratio.dark < min;
  }).length;

  return (
    <div className="flex flex-col gap-3">
      <div ref={lightRef} className="light hidden" aria-hidden="true" />
      <div ref={darkRef} className="dark hidden" aria-hidden="true" />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {ratios === null
          ? "Calculando contraste…"
          : `${pairs.length} pares medidos · ${failures} por debajo del mínimo en algún tema (texto ${MIN_TEXT_RATIO}:1, foco ${MIN_FOCUS_RATIO}:1)`}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Grupo</TableHead>
            <TableHead>Texto / indicador</TableHead>
            <TableHead>Fondo</TableHead>
            <TableHead className="text-right">Mínimo</TableHead>
            <TableHead className="text-right">Claro</TableHead>
            <TableHead className="text-right">Oscuro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pairs.map((pair, index) => {
            const ratio = ratios?.[index];
            return (
              <TableRow key={`${pair.foreground}/${pair.background}`}>
                <TableCell className="text-muted-foreground">
                  {pair.group}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  --{pair.foreground}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  --{pair.background}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {pair.min}:1
                </TableCell>
                <RatioCell value={ratio?.light} min={pair.min} />
                <RatioCell value={ratio?.dark} min={pair.min} />
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function RatioCell({ value, min }: { value: number | undefined; min: number }) {
  if (value === undefined) {
    return <TableCell className="text-right">—</TableCell>;
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
