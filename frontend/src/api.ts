import type { Envelope } from './types';
let csrf: string | undefined;
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      'The server returned an unexpected response. Please try again or contact your administrator.',
      response.status,
    );
  }
}
export async function api<T>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<Envelope<T>> {
  if (method !== 'GET' && !csrf) {
    const r = await fetch('/api/v1/auth/csrf', { credentials: 'include' });
    const json = await readJson(r);
    if (!r.ok) {
      throw new ApiError(
        json.error?.message ||
          'Unable to start a secure session. Please try again.',
        r.status,
      );
    }
    csrf = json.data.csrf_token;
  }
  const r = await fetch(`/api/v1/${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (r.status === 204) {
    csrf = undefined;
    return { data: undefined as T, meta: {} };
  }
  const json = await readJson(r);
  if (!r.ok) {
    if (r.status === 401 && !path.startsWith('auth/')) {
      window.dispatchEvent(new Event('session-expired'));
    }
    if (r.status === 403) window.dispatchEvent(new Event('access-denied'));
    if (r.status === 422 && json.error?.code === 'CSRF_INVALID')
      csrf = undefined;
    throw new ApiError(
      json.error?.message || 'Something went wrong. Please try again.',
      r.status,
    );
  }
  if (path === 'auth/login') csrf = undefined;
  return json;
}
