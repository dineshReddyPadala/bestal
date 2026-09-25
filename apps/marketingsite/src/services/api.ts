export type ApiProblemDetail = {
  title: string;
  status: number;
  detail?: string;
  code?: string;
  errors?: { field: string; message: string }[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: ApiProblemDetail,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  fieldErrors(): Record<string, string> {
    const next: Record<string, string> = {};
    for (const item of this.detail?.errors ?? []) {
      if (item.field && item.message) {
        next[item.field] = item.message;
      }
    }
    return next;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api/v1';

function buildUrl(path: string): string {
  const joined = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (/^https?:\/\//i.test(joined)) {
    return joined;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  return new URL(joined, origin).toString();
}

async function parseError(response: Response): Promise<ApiError> {
  let detail: ApiProblemDetail | undefined;
  try {
    detail = (await response.json()) as ApiProblemDetail;
  } catch {
    // ignore non-JSON error bodies
  }
  const message = detail?.detail ?? detail?.title ?? response.statusText ?? 'Request failed';
  return new ApiError(message, response.status, detail);
}

export async function publicApiRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as T;
}
