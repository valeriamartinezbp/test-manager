import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-16">
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
    </main>
  );
}
