import {
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  CalendarDays,
  Users,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Program } from '../types';
import { Button } from './ui/button';
export function Brand() {
  return (
    <div className="brand">
      <img
        className="brand-emblem"
        src="/images/ncc-badge.png"
        alt="NCC emblem"
        width={38}
        height={42}
      />
      <div className="institution-wordmark">
        NCC OTA <b>GWALIOR</b>
        <small>Officers’ Training Academy</small>
      </div>
    </div>
  );
}
export function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${status}`}>
      <i />
      {status.replaceAll('_', ' ')}
    </span>
  );
}
export function Loading() {
  return (
    <div role="status" aria-label="Loading" className="skeleton-grid">
      {[1, 2, 3, 4].map((i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry?: () => void;
}) {
  return (
    <div className="empty error">
      <AlertCircle />
      <h3>We couldn’t load this page</h3>
      <p>{error.message}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
export function Empty({
  title = 'Nothing here yet',
  text = 'New records will appear here when they are added.',
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <Shield />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div style={{ width: `${value}%` }} />
      </div>
      <span>{value}%</span>
    </div>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function StatCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <strong>{value}</strong>
      <small>
        <ArrowUpRight size={14} />
        {subtitle}
      </small>
    </div>
  );
}
export function ProgramCard({
  program,
  children,
}: {
  program: Program;
  children?: React.ReactNode;
}) {
  return (
    <article className="program-card">
      <div className={`program-art art-${program.id % 5}`}>
        <div className="art-grid" />
        <Shield size={65} strokeWidth={0.8} />
        <span>TRAIN. LEAD. INSPIRE.</span>
        <Badge status={program.status} />
      </div>
      <div className="program-body">
        <div className="overline">CADET DEVELOPMENT</div>
        <h3>{program.title}</h3>
        <p>{program.short_description}</p>
        <div className="program-meta">
          <span>
            <CalendarDays size={14} />
            {formatDate(program.start_date)} – {formatDate(program.end_date)}
          </span>
          <span>
            <MapPin size={14} />
            {program.location}
          </span>
        </div>
        <div className="program-footer">
          <span>
            <Users size={15} />
            {program.enrollment_count}
            {program.capacity ? ` / ${program.capacity}` : ''} cadets
          </span>
          {children || (
            <Link to={`/admin/programs/${program.id}`}>
              View program <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: undefined,
  });
export function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="pagination">
      <span>
        {total} records · Page {page} of {Math.max(1, Math.ceil(total / 20))}
      </span>
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        disabled={page * 20 >= total}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
