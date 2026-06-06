/**
 * Utilitários gerais da aplicação
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Formata uma data para formato brasilero (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
}

/**
 * Formata uma data e hora (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("pt-BR");
}

/**
 * Formata um valor em moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Trunca um texto com reticências
 */
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/**
 * Converte uma string em slug (url-friendly)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Cria um delay (util para simular carregamento)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verifica se está em ambiente de desenvolvimento
 */
export const isDev = process.env.NODE_ENV === "development";

/**
 * Copia texto para clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém parâmetro URL query
 */
export function getQueryParam(param: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}
