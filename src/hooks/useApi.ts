"use client";

import { useState, useCallback } from "react";

interface UseApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

interface ApiError {
  codigo?: string;
  mensagem?: string;
  message?: string;
}

export function useApi<T = any>(
  url: string,
  options: UseApiOptions = {}
): ApiResponse<T> & { execute: (body?: any) => Promise<void> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  const execute = useCallback(
    async (body?: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          method: options.method || "POST",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        setStatus(response.status);

        if (!response.ok) {
          const errorData = (await response.json()) as {
            erro?: ApiError;
            message?: string;
          };
          const errorMessage =
            errorData.erro?.mensagem ||
            errorData.message ||
            `Erro ${response.status}`;
          setError(errorMessage);
          return;
        }

        const responseData = (await response.json()) as T;
        setData(responseData);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [url, options]
  );

  return {
    data,
    loading,
    error,
    status,
    execute,
  };
}

/**
 * Hook customizado para fazer requisições GET
 */
export function useApiGet<T = any>(url: string) {
  return useApi<T>(url, { method: "GET" });
}

/**
 * Hook customizado para fazer requisições POST
 */
export function useApiPost<T = any>(url: string) {
  return useApi<T>(url, { method: "POST" });
}
