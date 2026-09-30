function trimSlash(value: string): string {
  return value.replace(/\/$/, '');
}

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return import.meta.env.DEV;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/** Product app origin — local Vite on 5174, production on app.bestal.co */
export function getAppOrigin(): string {
  if (isLocalHost()) {
    return trimSlash(import.meta.env.VITE_APP_ORIGIN_LOCAL || 'http://localhost:5174');
  }
  return trimSlash(import.meta.env.VITE_APP_ORIGIN || 'https://app.bestal.co');
}

export const CLIENT_WORKSPACE_URL = `${getAppOrigin()}/login/client`;
export const PORTAL_LOGIN_URL = `${getAppOrigin()}/login/portal`;

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
