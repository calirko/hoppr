const TOKEN_KEY = 'hoppr_token';

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
}

let currentUser: CurrentUser | null = null;

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  currentUser = null;
}

export function getCurrentUser(): CurrentUser | null {
  return currentUser;
}

export async function fetchMe(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      clearToken();
      return false;
    }
    if (!res.ok) return false;

    const body = await res.json();
    currentUser = body.user;
    return true;
  } catch {
    return false;
  }
}
