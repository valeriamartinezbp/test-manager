import { Badge } from "@/components/ui/badge";
import {
  getQaStatus,
  type QaDomain,
  type QaToken,
  type QaValue,
} from "@/lib/qa-status";
import { cn } from "@/lib/utils";

// Clases literales para que Tailwind las detecte. Texto e ícono usan el color
// del token sobre su fondo suave (contraste ≥ 4.5:1 en ambos temas).
const tokenClassName: Record<QaToken, string> = {
  "result-not-run": "bg-result-not-run-subtle text-result-not-run",
  "result-passed": "bg-result-passed-subtle text-result-passed",
  "result-failed": "bg-result-failed-subtle text-result-failed",
  "result-blocked": "bg-result-blocked-subtle text-result-blocked",
  "result-skipped": "bg-result-skipped-subtle text-result-skipped",
  "severity-critical": "bg-severity-critical-subtle text-severity-critical",
  "severity-high": "bg-severity-high-subtle text-severity-high",
  "severity-medium": "bg-severity-medium-subtle text-severity-medium",
  "severity-low": "bg-severity-low-subtle text-severity-low",
  "status-good": "bg-status-good-subtle text-status-good",
  "status-warning": "bg-status-warning-subtle text-status-warning",
  "status-critical": "bg-status-critical-subtle text-status-critical",
  "run-draft": "bg-run-draft-subtle text-run-draft",
  "run-active": "bg-run-active-subtle text-run-active",
  "run-paused": "bg-run-paused-subtle text-run-paused",
  "run-completed": "bg-run-completed-subtle text-run-completed",
};

export type StatusBadgeProps = {
  [D in QaDomain]: { domain: D; value: QaValue<D>; className?: string };
}[QaDomain];

/** Estado de QA con ícono + texto + color: nunca depende solo del color. */
export function StatusBadge({ domain, value, className }: StatusBadgeProps) {
  const { label, icon: Icon, token } = getQaStatus(domain, value);

  return (
    <Badge
      data-token={token}
      className={cn("border-transparent", tokenClassName[token], className)}
    >
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
