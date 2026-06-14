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
 * Remove toda a pontuação de um CPF, mantendo apenas os dígitos.
 * Forma canônica usada para armazenamento.
 */
export function normalizarCpf(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/**
 * Formata um CPF (com ou sem pontuação) na máscara 000.000.000-00.
 * Aplica a máscara progressivamente, permitindo valores parciais.
 */
export function formatCpf(value: string | null | undefined): string {
  const onlyNumbers = normalizarCpf(value).slice(0, 11);

  if (onlyNumbers.length <= 3) {
    return onlyNumbers;
  } else if (onlyNumbers.length <= 6) {
    return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3)}`;
  } else if (onlyNumbers.length <= 9) {
    return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6)}`;
  }
  return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6, 9)}-${onlyNumbers.slice(9, 11)}`;
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
