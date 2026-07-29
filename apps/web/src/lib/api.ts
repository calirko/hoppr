import { clearToken, getToken } from '@/lib/auth';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`/api${path}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
