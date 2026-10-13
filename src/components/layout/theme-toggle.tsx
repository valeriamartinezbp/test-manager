"use client";

import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

// Igual que el legacy: alterna respecto al tema visible (incluido el del sistema)
// y guarda la elección explícita. El render no depende del tema, así que no hay
// desajuste de hidratación.
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Cambiar tema: alternar entre modo claro y oscuro"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "rounded-full border border-border bg-card px-3 py-1.5 text-sm/[1.55] whitespace-nowrap",
        className,
      )}
    >
      Cambiar tema
    </button>
  );
}
