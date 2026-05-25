import axios from "axios";
import config from "@/config";
import { cachedGet, invalidateCache } from "@/lib/cache";

const api = axios.create({
  baseURL: config.API_URL,
  headers: { "Content-Type": "application/json" },
});

// Deduplicação de requests GET idênticos em voo
const pendingRequests = new Map<string, Promise<unknown>>();

api.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem("idToken");
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Wrapper que deduplica GETs idênticos em andamento
const originalGet = api.get.bind(api);
api.get = ((url: string, config?: unknown) => {
  const key = `${url}:${JSON.stringify((config as { params?: unknown })?.params || {})}`;
  const pending = pendingRequests.get(key);
  if (pending) return pending;

  const request = originalGet(url, config as never).finally(() => {
    pendingRequests.delete(key);
  });
  pendingRequests.set(key, request);
  return request;
}) as typeof api.get;

// TTLs por tipo de dado (em ms)
const CACHE_TTL = {
  dashboard: 120_000,  // 2 min - dados agregados mudam pouco
  students: 60_000,    // 1 min
  teachers: 60_000,
  grades: 60_000,
  schedule: 300_000,   // 5 min - horários mudam raramente
  subjects: 300_000,
  classes: 60_000,
} as const;

/**
 * GET com cache automático. Reduz chamadas repetidas à API.
 */
export async function apiGet<T = unknown>(url: string, params?: Record<string, string>, ttlKey?: keyof typeof CACHE_TTL): Promise<T> {
  const queryStr = params ? "?" + new URLSearchParams(params).toString() : "";
  const cacheKey = `GET:${url}${queryStr}`;
  const ttl = ttlKey ? CACHE_TTL[ttlKey] : 60_000;

  return cachedGet<T>(
    async () => {
      const response = await api.get(url, { params });
      return response.data;
    },
    cacheKey,
    ttl
  );
}

/**
 * POST/PUT/DELETE invalidam o cache relacionado automaticamente.
 */
export async function apiPost<T = unknown>(url: string, data?: unknown): Promise<T> {
  const response = await api.post(url, data);
  // Invalida cache do recurso modificado
  const resource = url.split("/")[1] || url;
  invalidateCache(resource);
  invalidateCache("dashboard"); // dashboard depende de tudo
  return response.data;
}

export async function apiDelete<T = unknown>(url: string, params?: Record<string, string>): Promise<T> {
  const response = await api.delete(url, { params });
  const resource = url.split("/")[1] || url;
  invalidateCache(resource);
  invalidateCache("dashboard");
  return response.data;
}

export { invalidateCache };
export default api;
