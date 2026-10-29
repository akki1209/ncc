import { afterEach, expect, it, vi } from 'vitest';
import { api } from './api';

afterEach(() => vi.unstubAllGlobals());

it('shows an actionable error when the CSRF endpoint returns an HTML proxy error', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(
      new Response('<!DOCTYPE html><h1>Blocked host</h1>', { status: 403 }),
    );
  vi.stubGlobal('fetch', fetch);
  await expect(
    api('auth/login', 'POST', {
      email: 'cadet@example.org',
      password: 'example',
    }),
  ).rejects.toMatchObject({
    status: 403,
    message:
      'The server returned an unexpected response. Please try again or contact your administrator.',
  });
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('preserves the API error when a secure session cannot be started', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: 'Service unavailable.' } }),
          { status: 503 },
        ),
      ),
  );
  await expect(api('auth/login', 'POST')).rejects.toMatchObject({
    status: 503,
    message: 'Service unavailable.',
  });
});
