import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Estilos",
  robots: { index: false },
};

type ColorToken = {
  legacy: string;
  token: string;
  swatchClassName: string;
};

// Clases literales para que Tailwind las detecte.
const colorTokens: readonly ColorToken[] = [
  {
    legacy: "--paper",
    token: "--background",
    swatchClassName: "bg-background",
  },
  { legacy: "--ink", token: "--foreground", swatchClassName: "bg-foreground" },
  {
    legacy: "--surface",
    token: "--card / --popover",
    swatchClassName: "bg-card",
  },
  {
    legacy: "--muted",
    token: "--muted-foreground",
    swatchClassName: "bg-muted-foreground",
  },
  { legacy: "(derivado)", token: "--muted", swatchClassName: "bg-muted" },
  {
    legacy: "--line",
    token: "--border / --input",
    swatchClassName: "bg-border",
  },
  {
    legacy: "--blue",
    token: "--primary / --ring",
    swatchClassName: "bg-primary",
  },
  {
    legacy: "--blue-ink",
    token: "--primary-foreground",
    swatchClassName: "bg-primary-foreground",
  },
  {
    legacy: "--blue-soft",
    token: "--secondary / --accent / --blue-soft",
    swatchClassName: "bg-blue-soft",
  },
  {
    legacy: "--blue-deep",
    token: "--blue-deep",
    swatchClassName: "bg-blue-deep",
  },
  { legacy: "--signal", token: "--signal", swatchClassName: "bg-signal" },
  {
    legacy: "--signal-text",
    token: "--signal-text",
    swatchClassName: "bg-signal-text",
  },
  {
    legacy: "--signal-soft",
    token: "--signal-soft",
    swatchClassName: "bg-signal-soft",
  },
  { legacy: "--ok", token: "--ok", swatchClassName: "bg-ok" },
  { legacy: "--ok-soft", token: "--ok-soft", swatchClassName: "bg-ok-soft" },
  {
    legacy: "--bad",
    token: "--destructive / --bad",
    swatchClassName: "bg-bad",
  },
  { legacy: "--bad-soft", token: "--bad-soft", swatchClassName: "bg-bad-soft" },
  { legacy: "--navy", token: "--navy", swatchClassName: "bg-navy" },
  { legacy: "--on-navy", token: "--on-navy", swatchClassName: "bg-on-navy" },
  { legacy: "--grid", token: "--grid", swatchClassName: "bg-grid" },
];

const radii = [
  { legacy: "--r-sm", value: "8px", className: "rounded-sm" },
  { legacy: "--r-md", value: "12px", className: "rounded-md" },
  { legacy: "--r-lg", value: "20px", className: "rounded-lg" },
] as const;

const buttonVariantNames = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

// Textos copiados de legacy/index.html y legacy/assets/js/app.js.
const phases = [
  {
    id: "planeacion",
    name: "Planeación",
    sop: "SOP-QA-001",
    title: "Planeación y estrategia de pruebas",
  },
  {
    id: "diseno",
    name: "Diseño",
    sop: "SOP-QA-002",
    title: "Diseño de test cases y cobertura",
  },
  {
    id: "ambiente",
    name: "Ambiente y datos",
    sop: "SOP-QA-003",
    title: "Configuración de entorno y datos de prueba",
  },
  {
    id: "ejecucion",
    name: "Ejecución",
    sop: "SOP-QA-004 a 007",
    title: "Ejecución en cuatro niveles",
  },
  {
    id: "cierre",
    name: "Cierre",
    sop: "SOP-QA-009",
    title: "Monitoreo, control y cierre de pruebas",
  },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-[clamp(30px,4vw,46px)] font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

export default function StylesPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-14 px-6 py-14">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="code">
            Solo en desarrollo · comparar con legacy/index.html
          </p>
          <h1 className="text-[clamp(38px,6vw,72px)] font-extrabold">
            Guía de estilos
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Colores">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {colorTokens.map((color) => (
            <li
              key={color.token}
              className="overflow-hidden rounded-md border border-border bg-card"
            >
              <div
                className={`h-16 border-b border-border ${color.swatchClassName}`}
              />
              <div className="flex flex-col gap-0.5 p-3 text-sm">
                <span className="font-semibold">{color.token}</span>
                <span className="code">{color.legacy}</span>
                <span className="code">{color.swatchClassName}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Tipografía">
        <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-7">
          <div className="flex flex-col gap-1">
            <p className="code">
              h1 · Bricolage Grotesque 800 · clamp(38px, 6vw, 72px)
            </p>
            <p className="font-display text-[clamp(38px,6vw,72px)] leading-[1.08] font-extrabold tracking-[-0.01em]">
              El proceso de QA, fase por fase
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="code">
              h2 · Bricolage Grotesque 800 · clamp(30px, 4vw, 46px)
            </p>
            <p className="font-display text-[clamp(30px,4vw,46px)] leading-[1.08] font-extrabold tracking-[-0.01em]">
              Ciclo de vida de un defecto
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="code">
              h3 · Bricolage Grotesque 700 · clamp(24px, 3vw, 34px)
            </p>
            <p className="font-display text-[clamp(24px,3vw,34px)] leading-[1.08] font-bold tracking-[-0.01em]">
              Planeación y estrategia de pruebas
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="code">Bricolage Grotesque 500</p>
            <p className="font-display text-2xl font-medium">
              Roles y responsabilidades
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <p className="code">.lead · IBM Plex Sans 400 · 19px</p>
            <p className="max-w-[60ch] text-[19px] text-muted-foreground">
              Del PRD al sign-off: cinco fases, seis quality gates y dos
              procesos que corren en paralelo. Toca una fase del mapa para ver
              sus pasos, responsables, entregables y excepciones.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="code">
              body · IBM Plex Sans 400 / 500 / 600 · 16px / 1.55
            </p>
            <p>
              Aplica a hallazgos en UI, API, SIT y UAT (SOP-QA-008). Toca un
              estado para ver quién actúa, o simula el recorrido de un defecto.
            </p>
            <p className="font-medium">
              Nada se despliega sin el sign-off formal de QA y los KPIs en meta.
            </p>
            <p className="font-semibold">
              Registro obligatorio: acta de la sesión y Matriz de Riesgos.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="code">.code · cifras tabulares, muted, 500</p>
            <p className="code">SOP-QA-001 · SOP-QA-004 a 007 · 1234567890</p>
          </div>
        </div>
      </Section>

      <Section title="Radios">
        <div className="flex flex-wrap gap-6">
          {radii.map((radius) => (
            <div
              key={radius.legacy}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`size-28 border-2 border-primary bg-blue-soft ${radius.className}`}
              />
              <span className="text-sm font-semibold">{radius.className}</span>
              <span className="text-sm code">
                {radius.legacy} · {radius.value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Componentes">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Button</CardTitle>
              <CardDescription>Variantes y tamaños</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {buttonVariantNames.map((variant) => (
                  <Button key={variant} variant={variant}>
                    {variant}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="xs">xs</Button>
                <Button size="sm">sm</Button>
                <Button>default</Button>
                <Button size="lg">lg</Button>
                <Button disabled>disabled</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge, Checkbox y Tooltip</CardTitle>
              <CardDescription>Estados y superposiciones</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge>default</Badge>
                <Badge variant="secondary">secondary</Badge>
                <Badge variant="outline">outline</Badge>
                <Badge variant="destructive">destructive</Badge>
                <Badge className="bg-signal-soft text-signal-text">
                  signal
                </Badge>
                <Badge className="bg-ok-soft text-ok">ok</Badge>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox defaultChecked />
                Registro obligatorio: acta de la sesión y Matriz de Riesgos.
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox />
                Nada se despliega sin el sign-off formal de QA y los KPIs en
                meta.
              </label>
              <div>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" />}>
                    Quality gate
                  </TooltipTrigger>
                  <TooltipContent>Muestra la condición de paso</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-2">
              <span className="text-sm code">CardFooter</span>
              <ThemeToggle />
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Fases del proceso de QA</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={phases[0].id}>
              <TabsList>
                {phases.map((phase) => (
                  <TabsTrigger key={phase.id} value={phase.id}>
                    {phase.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {phases.map((phase) => (
                <TabsContent key={phase.id} value={phase.id} className="pt-2">
                  <p className="code">{phase.sop}</p>
                  <h3 className="text-[26px]">{phase.title}</h3>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
            <CardDescription>Mapa de tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Tokens legacy y su equivalente actual</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Legacy</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Clase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colorTokens.map((color) => (
                  <TableRow key={color.token}>
                    <TableCell className="code">{color.legacy}</TableCell>
                    <TableCell>{color.token}</TableCell>
                    <TableCell className="code">
                      {color.swatchClassName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}
