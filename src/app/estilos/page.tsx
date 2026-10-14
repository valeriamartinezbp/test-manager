import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/layout";
import { StatusBadge } from "@/components/qa";
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
import { QA_DOMAIN_VALUES, QA_TOKENS } from "@/lib/qa-status";

import { ContrastTable } from "./contrast-table";

export const metadata: Metadata = {
  title: "Estilos",
  robots: { index: false },
};

const themeColorGroups: { title: string; tokens: string[] }[] = [
  {
    title: "Marca",
    tokens: [
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "accent",
      "accent-foreground",
      "ring",
    ],
  },
  {
    title: "Base",
    tokens: [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "muted",
      "muted-foreground",
      "border",
      "input",
      "destructive",
      "destructive-foreground",
    ],
  },
  {
    title: "Gráficas",
    tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
  },
  {
    title: "Sidebar",
    tokens: [
      "sidebar",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ],
  },
];

const textSizes = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "text-5xl",
] as const;

const fontWeights = [
  "font-light",
  "font-normal",
  "font-medium",
  "font-semibold",
  "font-bold",
  "font-extrabold",
] as const;

const radii = [
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-4xl",
] as const;

const shadows = [
  "shadow-2xs",
  "shadow-xs",
  "shadow-sm",
  "shadow",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
] as const;

const buttonVariantNames = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-3xl font-bold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ token, note }: { token: string; note?: string }) {
  return (
    <li className="overflow-hidden rounded-lg border bg-card shadow-xs">
      <div
        className="h-14 border-b"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <div className="flex flex-col p-2.5 text-xs">
        <span className="font-mono font-medium">--{token}</span>
        <span className="text-muted-foreground">{note ?? `bg-${token}`}</span>
      </div>
    </li>
  );
}

function DomainRow({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function StylesPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Solo en desarrollo</p>
          <h1 className="text-5xl font-extrabold tracking-tight">
            Sistema de diseño
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <Section
        id="paleta"
        title="Paleta"
        description="Tema de tweakcn (marca morado y naranja) y tokens semánticos de QA."
      >
        {themeColorGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">{group.title}</h3>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
              {group.tokens.map((token) => (
                <Swatch key={token} token={token} />
              ))}
            </ul>
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Semánticos de QA</h3>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {QA_TOKENS.flatMap((token) => [
              <Swatch key={token} token={token} />,
              <Swatch
                key={`${token}-foreground`}
                token={`${token}-foreground`}
              />,
              <Swatch key={`${token}-subtle`} token={`${token}-subtle`} />,
            ])}
          </ul>
        </div>
      </Section>

      <Section id="tipografia" title="Tipografía">
        <Card>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                font-sans · Red Hat Display
              </p>
              {textSizes.map((size) => (
                <p key={size} className={size}>
                  <span className="mr-3 font-mono text-xs text-muted-foreground">
                    {size}
                  </span>
                  Resultado de la corrida de regresión
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {fontWeights.map((weight) => (
                <span key={weight} className={`text-xl ${weight}`}>
                  {weight}
                </span>
              ))}
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  font-serif · Georgia (sistema)
                </p>
                <p className="font-serif text-xl">
                  Sign-off bloqueado si el pass rate es menor a 85%.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  font-mono · JetBrains Mono
                </p>
                <p className="font-mono">QA-1024 · npm run typecheck</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  Proporcionales (por defecto)
                </p>
                <p className="text-2xl font-semibold">
                  111.1% <br /> 888.8%
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  tabular-nums (tablas y KPIs)
                </p>
                <p className="text-2xl font-semibold tabular-nums">
                  111.1% <br /> 888.8%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        id="radios-sombras"
        title="Radios y sombras"
        description="--radius: 0.375rem; la escala se deriva de él."
      >
        <div className="flex flex-wrap gap-4">
          {radii.map((radius) => (
            <div key={radius} className="flex flex-col items-center gap-2">
              <div
                className={`size-20 border-2 border-primary bg-accent ${radius}`}
              />
              <span className="font-mono text-xs">{radius}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-6">
          {shadows.map((shadow) => (
            <div
              key={shadow}
              className={`flex h-20 items-center justify-center rounded-lg bg-card font-mono text-xs ${shadow}`}
            >
              {shadow}
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="estados"
        title="Estados de QA"
        description="StatusBadge: ícono + texto + color en cada valor del vocabulario."
      >
        <Card>
          <CardContent className="flex flex-col gap-5">
            <DomainRow title="Resultado de caso">
              {QA_DOMAIN_VALUES.testResult.map((value) => (
                <StatusBadge key={value} domain="testResult" value={value} />
              ))}
            </DomainRow>
            <DomainRow title="Severidad">
              {QA_DOMAIN_VALUES.severity.map((value) => (
                <StatusBadge key={value} domain="severity" value={value} />
              ))}
            </DomainRow>
            <DomainRow title="Estado de defecto">
              {QA_DOMAIN_VALUES.defectStatus.map((value) => (
                <StatusBadge key={value} domain="defectStatus" value={value} />
              ))}
            </DomainRow>
            <DomainRow title="Estado de corrida">
              {QA_DOMAIN_VALUES.runStatus.map((value) => (
                <StatusBadge key={value} domain="runStatus" value={value} />
              ))}
            </DomainRow>
            <DomainRow title="Semáforo">
              {QA_DOMAIN_VALUES.trafficLight.map((value) => (
                <StatusBadge key={value} domain="trafficLight" value={value} />
              ))}
            </DomainRow>
          </CardContent>
        </Card>
      </Section>

      <Section id="componentes" title="Componentes">
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
                <Badge variant="ghost">ghost</Badge>
                <Badge variant="link">link</Badge>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox defaultChecked />
                Incluir casos bloqueados
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox />
                Solo defectos críticos
              </label>
              <div>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" />}>
                    Pass rate
                  </TooltipTrigger>
                  <TooltipContent>
                    Sign-off bloqueado si es menor a 85%
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-2">
              <span className="text-sm text-muted-foreground">CardFooter</span>
              <ThemeToggle />
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Dominios del vocabulario de QA</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resultados">
              <TabsList>
                <TabsTrigger value="resultados">Resultados</TabsTrigger>
                <TabsTrigger value="severidades">Severidades</TabsTrigger>
                <TabsTrigger value="corridas">Corridas</TabsTrigger>
              </TabsList>
              <TabsContent value="resultados" className="flex gap-2 pt-2">
                {QA_DOMAIN_VALUES.testResult.map((value) => (
                  <StatusBadge key={value} domain="testResult" value={value} />
                ))}
              </TabsContent>
              <TabsContent value="severidades" className="flex gap-2 pt-2">
                {QA_DOMAIN_VALUES.severity.map((value) => (
                  <StatusBadge key={value} domain="severity" value={value} />
                ))}
              </TabsContent>
              <TabsContent value="corridas" className="flex gap-2 pt-2">
                {QA_DOMAIN_VALUES.runStatus.map((value) => (
                  <StatusBadge key={value} domain="runStatus" value={value} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
            <CardDescription>SLA por severidad (configurable)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Tiempos por defecto, en horas</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Severidad</TableHead>
                  <TableHead className="text-right">Respuesta</TableHead>
                  <TableHead className="text-right">Resolución</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <StatusBadge domain="severity" value="critica" />
                  </TableCell>
                  <TableCell className="text-right">4 h</TableCell>
                  <TableCell className="text-right">24 h</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <StatusBadge domain="severity" value="alta" />
                  </TableCell>
                  <TableCell className="text-right">8 h</TableCell>
                  <TableCell className="text-right">72 h</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <StatusBadge domain="severity" value="media" />
                  </TableCell>
                  <TableCell className="text-right">24 h</TableCell>
                  <TableCell className="text-right">120 h</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <StatusBadge domain="severity" value="baja" />
                  </TableCell>
                  <TableCell className="text-right">48 h</TableCell>
                  <TableCell className="text-right">240 h</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>

      <Section
        id="contraste"
        title="Contraste"
        description="Calculado en el navegador a partir de los valores reales de cada token, en claro y oscuro. Mínimo 4.5:1."
      >
        <Card>
          <CardContent>
            <ContrastTable />
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}
