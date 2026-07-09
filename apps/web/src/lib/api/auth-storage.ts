import type { Portal, TokenPair } from './types';

const ACCESS_KEY = 'bestal-access-token';
const REFRESH_KEY = 'bestal-refresh-token';
const PORTAL_KEY = 'bestal-portal';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredPortal(): Portal | null {
  const p = localStorage.getItem(PORTAL_KEY);
  return p as Portal | null;
}

export function setTokens(tokens: TokenPair, portal: Portal): void {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  localStorage.setItem(PORTAL_KEY, portal);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(PORTAL_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
