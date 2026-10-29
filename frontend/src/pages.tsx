import { useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Flag,
  Users,
  Award,
  Compass,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from './api';
import { Brand, ErrorState, Loading } from './components/common';
import { Button } from './components/ui/button';
import type { Program, User } from './types';
const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});
type LoginValues = z.infer<typeof loginSchema>;
export function Login() {
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const location = useLocation();
  const client = useQueryClient();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link className="brand-link" to="/">
          <Brand />
        </Link>
        <div className="auth-emblem">
          <ShieldCheck size={100} strokeWidth={0.7} />
        </div>
        <div className="auth-story-copy">
          <div className="eyebrow">PURPOSE. PRIDE. POSSIBILITY.</div>
          <h1>
            Great leaders
            <br />
            start with
            <br />
            <em>strong foundations.</em>
          </h1>
          <p>
            Your programs, progress, and certificates.
            <br />
            One institution. Your personal account.
          </p>
          <span>
            UNITY & DISCIPLINE <span>✦</span> NCC OTA GWALIOR
          </span>
        </div>
        <small>Officers’ Training Academy · Gwalior</small>
      </section>
      <section className="auth-form-area">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
        <div className="auth-form">
          <div className="eyebrow">WELCOME TO NCC OTA GWALIOR</div>
          <h1>Good to see you.</h1>
          <p>Sign in to view your programs and download certificates.</p>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              setError('');
              try {
                const { data } = await api<User>('auth/login', 'POST', values);
                client.setQueryData(['me'], { data });
                const requestedPath: unknown = location.state?.from;
                nav(
                  typeof requestedPath === 'string' &&
                    requestedPath.startsWith(`/${data.role}/`)
                    ? requestedPath
                    : `/${data.role}/dashboard`,
                );
              } catch (e) {
                setError((e as Error).message);
              }
            })}
          >
            <label>
              Email address
              <input
                autoComplete="email"
                placeholder="you@institution.edu"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <small className="field-error">
                  {form.formState.errors.email.message}
                </small>
              )}
            </label>
            <label>
              <span className="label-row">
                Password<Link to="/forgot-password">Forgot password?</Link>
              </span>
              <div className="password-field">
                <input
                  aria-label="Password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...form.register('password')}
                />
                <button
                  type="button"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <small className="field-error">
                  {form.formState.errors.password.message}
                </small>
              )}
            </label>
            {error && (
              <div role="alert" className="form-error">
                {error}
              </div>
            )}
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting
                ? 'Signing in…'
                : 'Sign in to your account'}
              <ArrowRight size={17} />
            </Button>
          </form>
          <div className="account-help">
            <ShieldCheck size={19} />
            <p>
              New to the portal?
              <br />
              <span>Your administrator will send you an invitation.</span>
            </p>
          </div>
          <div className="auth-secure">
            <ShieldCheck size={14} /> Secure access for students and
            administrators
          </div>
        </div>
      </section>
    </div>
  );
}
export function PasswordPage() {
  const [search] = useSearchParams();
  const token = search.get('token');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="simple-public">
      <Link to="/">
        <Brand />
      </Link>
      <div className="card recovery">
        <h1>{token ? 'Set your password' : 'Let’s get you back in.'}</h1>
        <p>
          {token
            ? 'Choose a password with at least 12 characters.'
            : 'Enter your registered email to receive a secure link.'}
        </p>
        {sent ? (
          <div className="success-message">
            <Check />
            {token
              ? 'Password saved. You can sign in.'
              : 'If the account exists, a secure link has been sent.'}
            <Link to="/login">Back to sign in →</Link>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError('');
              const data = Object.fromEntries(new FormData(e.currentTarget));
              try {
                if (token && data.password !== data.password_confirmation)
                  throw new Error('Passwords do not match.');
                await api('auth/password', token ? 'PUT' : 'POST', {
                  ...data,
                  token,
                });
                setSent(true);
                toast.success(token ? 'Password updated' : 'Request received');
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {token ? (
              <>
                <label>
                  New password
                  <input
                    name="password"
                    type="password"
                    minLength={12}
                    required
                    autoComplete="new-password"
                  />
                </label>
                <label>
                  Confirm password
                  <input
                    name="password_confirmation"
                    type="password"
                    minLength={12}
                    required
                    autoComplete="new-password"
                  />
                </label>
              </>
            ) : (
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button disabled={busy}>
              {busy
                ? 'Please wait…'
                : token
                  ? 'Save password'
                  : 'Send secure link'}
            </Button>
            <Link to="/login">Back to sign in</Link>
          </form>
        )}
      </div>
    </div>
  );
}
export function PublicPage({ about = false }: { about?: boolean }) {
  const query = useQuery({
    queryKey: ['public-programs'],
    queryFn: () => api<Program[]>('public/programs'),
  });
  return (
    <div className="public-page">
      <header>
        <Link to="/" className="brand-link">
          <Brand />
        </Link>
        <nav>
          <Link to="/about">About the programme</Link>
          <Link to="/login" className="button button-primary">
            Portal sign in <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>
      <section className="public-hero">
        <div className="eyebrow">
          <span /> UNITY. DISCIPLINE. SERVICE.
        </div>
        <h1>
          {about ? 'Character is built.' : 'A purpose to serve.'}
          <br />
          <em>{about ? 'Leaders are made.' : 'A place to grow.'}</em>
        </h1>
        <p>
          {about
            ? 'We bring cadets and administrators together around a shared commitment to learning, responsibility, and service.'
            : 'Discover your potential through meaningful training, shared challenges, and a community that leads by example.'}
        </p>
        <Link to="/login" className="button button-primary">
          Access your account <ArrowRight size={18} />
        </Link>
        <div className="hero-seal">
          <ShieldCheck size={88} strokeWidth={0.8} />
          <span>NCC OTA GWALIOR</span>
          <small>UNITY & DISCIPLINE</small>
        </div>
      </section>
      <section className="values-grid">
        {[
          [
            Flag,
            'Lead with purpose',
            'Build the confidence to take initiative.',
          ],
          [
            Users,
            'Grow together',
            'Find strength in teamwork and shared experience.',
          ],
          [
            Compass,
            'Go beyond',
            'Challenge yourself and explore new possibilities.',
          ],
          [
            Award,
            'Celebrate progress',
            'Recognize every milestone in your training journey.',
          ],
        ].map(([Icon, title, text]) => {
          const I = Icon as typeof Flag;
          return (
            <div key={String(title)}>
              <I size={24} />
              <h3>{String(title)}</h3>
              <p>{String(text)}</p>
            </div>
          );
        })}
      </section>
      <section className="public-programs">
        <div className="eyebrow">LEARN. TRAIN. ACHIEVE.</div>
        <h2>Experiences that shape you.</h2>
        <p>
          Explore our institutional training opportunities. Contact your
          administrator for enrollment.
        </p>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} />
        ) : (
          <div className="public-program-grid">
            {query.data?.data.map((p) => (
              <div className="card" key={p.id}>
                <span className="overline">TRAINING PROGRAM</span>
                <h3>{p.title}</h3>
                <p>{p.short_description}</p>
                <p>{p.location}</p>
                <Link to="/login">
                  View your assignments <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}
        <small>
          Sample institutional programs. Completion certificates are not
          official NCC A/B/C certifications.
        </small>
      </section>
      <footer>
        <Brand />
        <span>Growing through service. Leading with integrity.</span>
        <Link to="/login">Sign in →</Link>
      </footer>
    </div>
  );
}
