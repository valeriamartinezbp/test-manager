import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import { PortfolioTable } from "@/features/portfolio";
import {
  listPortfolioProjects,
  type PortfolioProject,
} from "@/server/portfolio";

async function Portfolio() {
  // Fuera del try: es la señal de render dinámico de Next y no debe atraparse
  await connection();

  let projects: PortfolioProject[];
  try {
    projects = await listPortfolioProjects();
  } catch (error) {
    console.error("No se pudo leer el portafolio", error);
    return (
      <p role="alert" className="text-status-critical">
        No se pudo conectar a la base de datos. Revisa que MySQL esté corriendo
        y que <code className="font-mono text-sm">.env</code> tenga
        DATABASE_URL.
      </p>
    );
  }
  return <PortfolioTable projects={projects} />;
}

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          BluePixel · QA Center
        </h1>
        <p className="text-lg text-muted-foreground">
          Hub central de calidad de BluePixel.
        </p>
        <div>
          <Link href="/proceso" className={buttonVariants({ size: "lg" })}>
            Ver el proceso de QA
          </Link>
        </div>
      </header>

      <section aria-labelledby="portafolio" className="flex flex-col gap-4">
        <h2 id="portafolio" className="text-2xl font-bold tracking-tight">
          Portafolio
        </h2>
        <Suspense
          fallback={
            <p className="text-muted-foreground" aria-live="polite">
              Cargando proyectos…
            </p>
          }
        >
          <Portfolio />
        </Suspense>
      </section>
    </main>
  );
}
