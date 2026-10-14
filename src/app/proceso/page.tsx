import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proceso de QA",
};

export default function ProcesoPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">
        El proceso de QA, fase por fase
      </h1>
      <p className="text-lg text-muted-foreground">Sección en migración</p>
      <Link
        href="/"
        className="w-fit rounded-sm text-sm underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
