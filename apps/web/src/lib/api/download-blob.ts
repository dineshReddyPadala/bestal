import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth-storage';
import type { ApiDataResponse, LoginRequest, TokenPair } from './types';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api/v1';

export async function downloadAuthenticatedBlob(
  path: string,
  fallbackName: string,
): Promise<void> {
  const headers: Record<string, string> = { Accept: '*/*' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response = await fetch(`${BASE_URL}${path}`, { headers });
  if (response.status === 401 && getRefreshToken()) {
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });
    if (refreshResponse.ok) {
      const json = (await refreshResponse.json()) as ApiDataResponse<TokenPair>;
      const portal = localStorage.getItem('bestal-portal') as LoginRequest['portal'] | null;
      if (portal) setTokens(json.data, portal);
      else {
        localStorage.setItem('bestal-access-token', json.data.accessToken);
        localStorage.setItem('bestal-refresh-token', json.data.refreshToken);
      }
      headers.Authorization = `Bearer ${json.data.accessToken}`;
      response = await fetch(`${BASE_URL}${path}`, { headers });
    } else {
      clearTokens();
    }
  }

  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  const fileName = match?.[1] ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
