import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages';
import { ProgramForm, StudentForm } from './forms';
import { Progress, Badge } from './components/common';
import { CertificatesPage } from './admin';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function wrap(component: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>,
  );
}
describe('Portal workflows', () => {
  it('validates login before making a network request', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    wrap(<Login />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in to your account' }),
    );
    expect(
      await screen.findByText('Enter a valid email address.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('requires student registration details', async () => {
    wrap(<StudentForm onDone={() => {}} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Register & send invitation' }),
    );
    expect(
      await screen.findByText('Institution is required.'),
    ).toBeInTheDocument();
  });
  it('rejects invalid program dates', async () => {
    wrap(<ProgramForm onDone={() => {}} />);
    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-10-25' },
    });
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2026-10-20' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Create draft program' }),
    );
    await waitFor(() =>
      expect(
        screen.getByText('End date must follow start date.'),
      ).toBeInTheDocument(),
    );
  });
  it('renders explicit progress and status independently', () => {
    render(
      <>
        <Progress value={100} />
        <Badge status="in_progress" />
      </>,
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('in progress')).toBeInTheDocument();
  });
  it('uses authorized certificate download endpoints', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              id: 8,
              certificate_number: 'NCC-TEST',
              student_name_snapshot: 'Test Cadet',
              program_title_snapshot: 'Example Camp',
              issued_at: '2026-10-20',
              status: 'active',
              pdf_ready: true,
            },
          ],
          meta: { total: 1 },
        }),
      }),
    );
    wrap(<CertificatesPage student />);
    expect(
      await screen.findByRole('link', { name: 'Download PDF' }),
    ).toHaveAttribute('href', '/api/v1/student/certificates/8/download');
  });
});

describe('Certificate access after sign-in', () => {
  it.each([
    ['/student/certificates', 'Certificates destination'],
    ['/admin/certificates', 'Student dashboard destination'],
  ])('returns a student safely from %s', async (requestedPath, destination) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => ({
        ok: true,
        status: 200,
        json: async () => ({
          data: url.endsWith('/csrf')
            ? { csrf_token: 'test-csrf' }
            : { id: 1, role: 'student', name: 'Test Participant' },
          meta: {},
        }),
      })),
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter
          initialEntries={[
            { pathname: '/login', state: { from: requestedPath } },
          ]}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/student/certificates"
              element={<div>Certificates destination</div>}
            />
            <Route
              path="/student/dashboard"
              element={<div>Student dashboard destination</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'participant@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
      target: { value: 'TestPassword123!' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in to your account' }),
    );
    expect(await screen.findByText(destination)).toBeInTheDocument();
  });
});
