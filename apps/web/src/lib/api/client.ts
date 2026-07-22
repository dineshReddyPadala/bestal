import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './auth-storage';
import type {
  ApiDataResponse,
  ApiPaginatedResponse,
  ApiProblemDetail,
  AuthUserProfile,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  ResetPasswordRequest,
  TokenPair,
} from './types';
import { ApiError } from './types';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api/v1';

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
};

let refreshPromise: Promise<boolean> | null = null;

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const joined = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  // Relative bases (e.g. /api/v1) need an origin — resolve against the current page
  // so Vite can proxy /api/v1 → the Node API.
  const url = /^https?:\/\//i.test(joined)
    ? new URL(joined)
    : new URL(joined, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseError(response: Response): Promise<ApiError> {
  let detail: ApiProblemDetail | undefined;
  try {
    detail = (await response.json()) as ApiProblemDetail;
  } catch {
    // ignore
  }
  const message = detail?.detail ?? detail?.title ?? response.statusText ?? 'Request failed';
  return new ApiError(message, response.status, detail);
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      clearTokens();
      return false;
    }
    const json = (await response.json()) as ApiDataResponse<TokenPair>;
    const portal = localStorage.getItem('bestal-portal') as LoginRequest['portal'] | null;
    if (portal) {
      setTokens(json.data, portal);
    } else {
      localStorage.setItem('bestal-access-token', json.data.accessToken);
      localStorage.setItem('bestal-refresh-token', json.data.refreshToken);
    }
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function ensureRefreshed(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, headers = {}, params } = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  const doFetch = () =>
    fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });

  let response = await doFetch();

  if (response.status === 401 && auth && getRefreshToken()) {
    const refreshed = await ensureRefreshed();
    if (refreshed) {
      const token = getAccessToken();
      if (token) requestHeaders.Authorization = `Bearer ${token}`;
      response = await doFetch();
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(body: LoginRequest): Promise<TokenPair> {
  const json = await apiRequest<ApiDataResponse<TokenPair>>('/auth/login', {
    method: 'POST',
    body,
    auth: false,
  });
  setTokens(json.data, body.portal);
  return json.data;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    await apiRequest<ApiDataResponse<{ message: string }>>('/auth/logout', {
      method: 'POST',
      body: refreshToken ? { refreshToken } : {},
    });
  } finally {
    clearTokens();
  }
}

export async function getMe(): Promise<AuthUserProfile> {
  const json = await apiRequest<ApiDataResponse<AuthUserProfile>>('/auth/me');
  return json.data;
}

export async function forgotPassword(
  body: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const json = await apiRequest<ApiDataResponse<ForgotPasswordResponse>>('/auth/forgot-password', {
    method: 'POST',
    body,
    auth: false,
  });
  return json.data;
}

export async function resetPassword(
  body: ResetPasswordRequest,
): Promise<{ message: string }> {
  const json = await apiRequest<ApiDataResponse<{ message: string }>>('/auth/reset-password', {
    method: 'POST',
    body,
    auth: false,
  });
  return json.data;
}

// ─── Generic list helper ──────────────────────────────────────────────────────

export type ListQuery = {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined | null;
};

export async function apiList<T>(
  path: string,
  query: ListQuery = {},
): Promise<ApiPaginatedResponse<T>> {
  return apiRequest<ApiPaginatedResponse<T>>(path, { params: query });
}

export async function apiGet<T>(path: string): Promise<T> {
  const json = await apiRequest<ApiDataResponse<T>>(path);
  return json.data;
}

export async function apiCreate<T>(path: string, body: unknown): Promise<T> {
  const json = await apiRequest<ApiDataResponse<T>>(path, { method: 'POST', body });
  return json.data;
}

export async function apiUpdate<T>(path: string, body: unknown): Promise<T> {
  const json = await apiRequest<ApiDataResponse<T>>(path, { method: 'PATCH', body });
  return json.data;
}

export async function apiAction<T>(path: string, body?: unknown): Promise<T> {
  const json = await apiRequest<ApiDataResponse<T>>(path, {
    method: 'POST',
    body: body ?? {},
  });
  return json.data;
}

export async function apiDelete(path: string): Promise<void> {
  await apiRequest<void>(path, { method: 'DELETE' });
}

export { BASE_URL };
