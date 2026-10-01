import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data ISO (YYYY-MM-DD) para o padrão brasileiro (DD/MM/YYYY).
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  // Se já tem T (datetime), pega só a parte da data
  const datePart = dateStr.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Formata um datetime ISO para o padrão brasileiro (DD/MM/YYYY HH:mm).
 */
export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * Média aritmética de uma lista de números. Retorna NaN se vazia.
 */
export function mean(values: number[]): number {
  if (values.length === 0) return NaN;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

/**
 * Mediana de uma lista de números. Retorna NaN se vazia.
 */
export function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
