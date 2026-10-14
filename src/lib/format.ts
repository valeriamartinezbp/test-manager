const dateOnlyFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Fecha de solo día (guardada como UTC 00:00) en formato dd/mm/aaaa.
 * Se formatea en UTC para que no se recorra un día en husos horarios negativos.
 */
export function formatDateOnly(date: Date): string {
  return dateOnlyFormatter.format(date);
}
