import { useCallback } from 'react';
import { api } from '@/lib/api';
import type { AxiosRequestConfig } from 'axios';

/**
 * Hook utilitário que expõe métodos tipados para chamadas HTTP.
 * Usa a instância axios central (lib/api.ts) que já injeta
 * o token JWT e trata 401 automaticamente.
 */
export function useAPI() {
  const get = useCallback(
    <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
      api.get<T>(url, config).then(r => r.data),
    []
  );

  const post = useCallback(
    <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
      api.post<T>(url, body, config).then(r => r.data),
    []
  );

  const put = useCallback(
    <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
      api.put<T>(url, body, config).then(r => r.data),
    []
  );

  const patch = useCallback(
    <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
      api.patch<T>(url, body, config).then(r => r.data),
    []
  );

  const del = useCallback(
    <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
      api.delete<T>(url, config).then(r => r.data),
    []
  );

  return { get, post, put, patch, del };
}
