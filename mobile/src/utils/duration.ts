const MS_PER_DAY = 24 * 60 * 60 * 1000; // milisegundos que tiene un día, porque en JavaScript al restar fechas obtienes milisegundos
const BILLING_MONTH_DAYS = 30; // según nuestra RN, 1 mes de alquiler se cobra por cada 30 días completos

function pluralize(value: number, singular: string, plural: string): string { // función auxiliar para por ejemplo: pluralize(1, "mes", "meses") => "1 mes", pluralize(2, "mes", "meses") => "2 meses"
  return `${value} ${value === 1 ? singular : plural}`;
}

function toUtcDateOnly(date: Date): number { // para guardar solo la fecha sin la hora
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatRentalDuration(start: Date, end: Date): string {
  const startUtc = toUtcDateOnly(start);
  const endUtc = toUtcDateOnly(end);
  const diffDays = Math.max(0, Math.round((endUtc - startUtc) / MS_PER_DAY)) + 1; 

  const months = Math.floor(diffDays / BILLING_MONTH_DAYS);
  const days = diffDays % BILLING_MONTH_DAYS;

  if (diffDays === 0) return pluralize(0, "d\u00eda", "d\u00edas");

  if (days === 0) {
    return pluralize(months, "mes", "meses");
  }

  if (months === 0) {
    return pluralize(days, "d\u00eda", "d\u00edas");
  }

  return `${pluralize(months, "mes", "meses")} y ${pluralize(days, "d\u00eda", "d\u00edas")}`;
}

