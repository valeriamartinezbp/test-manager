"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

type ThemeToggleProps = {
  className?: string;
};

// Alterna respecto al tema visible (incluido el del sistema) y guarda la elección.
// El HTML no depende del tema: los íconos se muestran u ocultan con la variante
// dark de CSS, así que no hay desajuste de hidratación.
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      aria-label="Cambiar tema: alternar entre modo claro y oscuro"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun aria-hidden="true" className="dark:hidden" />
      <Moon aria-hidden="true" className="hidden dark:block" />
      Cambiar tema
    </Button>
  );
}
