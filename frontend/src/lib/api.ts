/**
 * Cliente HTTP centralizado hacia el backend NestJS (:4001).
 */
import { API_URL, LOGIN_PATH } from "./constants";
import { useAuthStore } from "@/stores/authStore";

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  requireAuth?: boolean;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().token;
}

/**
 * Realiza fetch autenticado al backend educativo.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { timeoutMs = 120_000, requireAuth = true, ...fetchOpts } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOpts.headers as Record<string, string> | undefined) ?? {}),
  };

  if (requireAuth) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...fetchOpts,
      signal: controller.signal,
      headers,
    });

    if (res.status === 401 && requireAuth && typeof window !== "undefined") {
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = LOGIN_PATH;
      }
    }

    if (!res.ok) {
      let detail = `API error: ${res.status}`;
      try {
        const body = await res.json();
        const msg = body?.message ?? body?.detail ?? body?.error;
        if (typeof msg === "string") detail = msg;
        else if (Array.isArray(msg)) detail = msg.join("; ");
      } catch {
        // body no JSON
      }
      throw new Error(detail);
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}
