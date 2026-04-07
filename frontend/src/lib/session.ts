import { AuthResponse } from './types';

const SESSION_KEY = 'docfish.auth';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function readStoredSession(): AuthResponse | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch (_error) {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function storeSession(session: AuthResponse): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}

export function readAuthToken(): string | null {
  return readStoredSession()?.token || null;
}
