import { StatusBadge } from "@/components/qa";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateOnly } from "@/lib/format";
import { QA_PHASE_LABELS } from "@/lib/qa-status";
import type { PortfolioProject } from "@/server/portfolio";

export function PortfolioTable({ projects }: { projects: PortfolioProject[] }) {
  if (projects.length === 0) {
    return (
      <p className="text-muted-foreground">
        No hay proyectos registrados. Carga los datos de ejemplo con{" "}
        <code className="font-mono text-sm">npm run db:seed</code>.
      </p>
    );
  }

  return (
    <Table>
      <TableCaption>
        Riesgo calculado con los defectos abiertos y la desviación contra la
        fecha compromiso original.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Proyecto</TableHead>
          <TableHead scope="col">Líder QA</TableHead>
          <TableHead scope="col">Fase</TableHead>
          <TableHead scope="col">Fecha estimada</TableHead>
          <TableHead scope="col">Riesgo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">
              {project.name}
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                {project.key}
              </span>
            </TableCell>
            <TableCell>
              {project.leadName ?? (
                <span className="text-muted-foreground">
                  Sin líder asignado
                </span>
              )}
            </TableCell>
            <TableCell>{QA_PHASE_LABELS[project.qaPhase]}</TableCell>
            <TableCell>
              {project.estimatedDate ? (
                <time
                  dateTime={project.estimatedDate.toISOString().slice(0, 10)}
                >
                  {formatDateOnly(project.estimatedDate)}
                </time>
              ) : (
                <span className="text-muted-foreground">Sin fecha</span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge domain="riskLevel" value={project.risk} />
              {project.riskIsManual ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  Fijado manualmente
                </span>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
