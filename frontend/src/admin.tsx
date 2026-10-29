import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  ArrowRight,
  Download,
  Award,
  MapPin,
  CalendarDays,
  Users,
  Pencil,
  ShieldCheck,
  BookOpen,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from './api';
import {
  Badge,
  Empty,
  ErrorState,
  Loading,
  PageHeader,
  Pagination,
  ProgramCard,
  Progress,
  formatDate,
} from './components/common';
import { Button } from './components/ui/button';
import { Modal } from './components/ui/dialog';
import { ProgramForm, StudentForm } from './forms';
import type { Certificate, Enrollment, Program, User } from './types';
export function StudentsPage() {
  const [search, setSearch] = useSearchParams();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['students', q, page],
    queryFn: () =>
      api<User[]>(`admin/students?q=${encodeURIComponent(q)}&page=${page}`),
  });
  return (
    <>
      <PageHeader
        eyebrow="PEOPLE & POTENTIAL"
        title="Your cadets. Tomorrow’s leaders."
        description="Manage student profiles and support every training journey."
        action={
          <Button onClick={() => setSearch({ new: '1' })}>
            <Plus size={17} /> Register student
          </Button>
        }
      />
      <div className="card">
        <div className="table-toolbar">
          <div>
            <h2>
              Student directory{' '}
              <span className="count-pill">{query.data?.meta.total || 0}</span>
            </h2>
            <p>Your growing community of cadets</p>
          </div>
          <div className="search-input">
            <Search size={17} />
            <input
              aria-label="Search students"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search name or email…"
            />
          </div>
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} />
        ) : !query.data.data.length ? (
          <Empty title="No students found" />
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Institution</th>
                    <th>Course / class</th>
                    <th>Account status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="person-cell">
                          <span className="avatar">
                            {u.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </span>
                          <div>
                            <strong>{u.name}</strong>
                            <small>{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{u.profile?.institution_name}</td>
                      <td>{u.profile?.course_or_class}</td>
                      <td>
                        <Badge status={u.active ? 'active' : 'inactive'} />
                      </td>
                      <td>
                        <Link
                          className="table-action"
                          to={`/admin/students/${u.id}`}
                          aria-label={`View ${u.name}`}
                        >
                          <ArrowRight size={17} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              total={query.data.meta.total || 0}
              onChange={setPage}
            />
          </>
        )}
      </div>
      {search.has('new') && (
        <Modal
          title="Register a student"
          description="Start a new cadet’s journey with a secure invitation."
          onClose={() => setSearch({})}
        >
          <StudentForm onDone={() => setSearch({})} />
        </Modal>
      )}
    </>
  );
}
export function StudentDetail() {
  const { id } = useParams();
  const client = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const query = useQuery({
    queryKey: ['student', id],
    queryFn: () => api<User>(`admin/students/${id}`),
  });
  const enrollments = useQuery({
    queryKey: ['student-enrollments', id],
    queryFn: () => api<Enrollment[]>(`admin/students/${id}/enrollments`),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorState error={query.error} />;
  const u = query.data.data;
  return (
    <>
      <Link className="back-link" to="/admin/students">
        ← All students
      </Link>
      <PageHeader
        eyebrow="STUDENT PROFILE"
        title={u.name}
        description={u.profile?.institution_name || ''}
        action={
          <Button variant="outline" onClick={() => setEdit(true)}>
            <Pencil size={16} /> Edit profile
          </Button>
        }
      />
      <div className="detail-grid">
        <section className="card detail-card">
          <div className="profile-heading">
            <span className="avatar large">
              {u.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <Badge status={u.active ? 'active' : 'inactive'} />
          </div>
          <h2>Cadet information</h2>
          <dl>
            {[
              ['Email', u.email],
              ['Mobile', u.profile?.mobile_number],
              ['Date of birth', u.profile?.date_of_birth],
              ['Gender', u.profile?.gender],
              ['Institution', u.profile?.institution_name],
              ['Course / class', u.profile?.course_or_class],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <Button variant="outline" onClick={() => setConfirm(true)}>
            {u.active ? 'Deactivate account' : 'Activate account'}
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              try {
                await api('auth/password', 'POST', { email: u.email });
                toast.success('Invitation or recovery link requested.');
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
          >
            Resend setup link
          </Button>
        </section>
        <section className="card detail-card">
          <h2>Training enrollments</h2>
          {enrollments.isPending ? (
            <Loading />
          ) : enrollments.error ? (
            <ErrorState error={enrollments.error} />
          ) : enrollments.data?.data.length ? (
            enrollments.data.data.map((e) => (
              <div className="progress-row" key={e.id}>
                <Link to="/admin/enrollments">
                  <h3>{e.program_title}</h3>
                </Link>
                <Badge status={e.status} />
                <Progress value={e.progress_percent} />
              </div>
            ))
          ) : (
            <Empty title="No enrollments yet" />
          )}
        </section>
      </div>
      {edit && (
        <Modal title="Edit student profile" onClose={() => setEdit(false)}>
          <StudentForm student={u} onDone={() => setEdit(false)} />
        </Modal>
      )}
      {confirm && (
        <Confirm
          title={
            u.active ? 'Deactivate this account?' : 'Activate this account?'
          }
          text={
            u.active
              ? 'The student will lose access to the portal. Their records and certificates will remain preserved.'
              : 'The student will be able to sign in using their configured password.'
          }
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            await api(
              `admin/students/${id}/${u.active ? 'deactivate' : 'activate'}`,
              'PATCH',
            );
            await client.invalidateQueries();
          }}
        />
      )}
    </>
  );
}
export function ProgramsPage() {
  const [search, setSearch] = useSearchParams();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const query = useQuery({
    queryKey: ['programs', status, page, q],
    queryFn: () =>
      api<Program[]>(
        `admin/programs?page=${page}&status=${status}&q=${encodeURIComponent(q)}`,
      ),
  });
  return (
    <>
      <PageHeader
        eyebrow="EXPERIENCES THAT SHAPE LEADERS"
        title="Programs with a purpose."
        description="Plan, manage, and follow every camp from the first day to the final milestone."
        action={
          <Button onClick={() => setSearch({ new: '1' })}>
            <Plus size={17} /> Create program
          </Button>
        }
      />
      <div className="filter-bar">
        <div className="tab-list">
          {['', 'draft', 'published', 'ongoing', 'completed', 'cancelled'].map(
            (s) => (
              <button
                key={s}
                className={status === s ? 'selected' : ''}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
              >
                {s || 'All programs'}
              </button>
            ),
          )}
        </div>
        <div className="search-input">
          <Search size={16} />
          <input
            placeholder="Search programs…"
            aria-label="Search programs"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : query.data.data.length ? (
        <>
          <div className="program-grid">
            {query.data.data.map((p) => (
              <ProgramCard program={p} key={p.id} />
            ))}
          </div>
          <Pagination
            page={page}
            total={query.data.meta.total || 0}
            onChange={setPage}
          />
        </>
      ) : (
        <Empty
          title="No programs found"
          text="Create a program or try another filter."
        />
      )}
      {search.has('new') && (
        <Modal
          title="Create a training program"
          description="Begin with a draft. Publish when you’re ready to enroll cadets."
          onClose={() => setSearch({})}
        >
          <ProgramForm onDone={() => setSearch({})} />
        </Modal>
      )}
    </>
  );
}
export function ProgramDetail() {
  const { id } = useParams();
  const client = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [enroll, setEnroll] = useState(false);
  const [operation, setOperation] = useState('');
  const query = useQuery({
    queryKey: ['program', id],
    queryFn: () => api<Program>(`admin/programs/${id}`),
  });
  const enrollments = useQuery({
    queryKey: ['program-enrollments', id],
    queryFn: () => api<Enrollment[]>(`admin/enrollments?program_id=${id}`),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorState error={query.error} />;
  const p = query.data.data;
  const operations: Record<string, string[]> = {
    draft: ['publish', 'cancel'],
    published: ['start', 'cancel'],
    ongoing: ['complete', 'cancel'],
    completed: ['generate_certificates'],
  };
  return (
    <>
      <Link className="back-link" to="/admin/programs">
        ← All programs
      </Link>
      <PageHeader
        eyebrow="TRAINING PROGRAM"
        title={p.title}
        description={p.short_description}
        action={
          <Button variant="outline" onClick={() => setEdit(true)}>
            <Pencil size={16} /> Edit program
          </Button>
        }
      />
      <div className="detail-grid">
        <section className="card detail-card">
          <Badge status={p.status} />
          <h2>About this program</h2>
          <p>{p.description}</p>
          <dl>
            <div>
              <dt>
                <CalendarDays size={15} /> Schedule
              </dt>
              <dd>
                {formatDate(p.start_date)} – {formatDate(p.end_date)}
              </dd>
            </div>
            <div>
              <dt>
                <MapPin size={15} /> Location
              </dt>
              <dd>{p.location}</dd>
            </div>
            <div>
              <dt>
                <Users size={15} /> Capacity
              </dt>
              <dd>
                {p.enrollment_count} / {p.capacity || 'Unlimited'} cadets
              </dd>
            </div>
          </dl>
          <h3>Eligibility requirements</h3>
          <p>
            {p.eligibility_criteria ||
              'Confirm institutional eligibility before enrollment.'}
          </p>
          <div className="action-wrap">
            {operations[p.status]?.map((op) => (
              <Button
                variant={op === 'cancel' ? 'outline' : 'default'}
                key={op}
                onClick={() => setOperation(op)}
              >
                {op.replaceAll('_', ' ')}
              </Button>
            ))}
          </div>
        </section>
        <section className="card detail-card">
          <div className="section-header">
            <h2>Enrolled cadets</h2>
            {['published', 'ongoing'].includes(p.status) && (
              <Button onClick={() => setEnroll(true)}>
                <Plus size={16} /> Enroll cadets
              </Button>
            )}
          </div>
          {enrollments.isPending ? (
            <Loading />
          ) : enrollments.error ? (
            <ErrorState error={enrollments.error} />
          ) : enrollments.data.data.length ? (
            enrollments.data.data.map((e) => (
              <div className="progress-row" key={e.id}>
                <h3>{e.student_name}</h3>
                <Badge status={e.status} />
                <Progress value={e.progress_percent} />
              </div>
            ))
          ) : (
            <Empty title="No cadets assigned yet" />
          )}
          {(enrollments.data?.meta.total || 0) > 20 && (
            <Link className="inline-link" to="/admin/enrollments">
              View all enrollments <ArrowRight size={14} />
            </Link>
          )}
        </section>
      </div>
      {edit && (
        <Modal title="Edit program" onClose={() => setEdit(false)}>
          <ProgramForm program={p} onDone={() => setEdit(false)} />
        </Modal>
      )}
      {enroll && (
        <Modal
          title="Assign cadets"
          description="Select eligible cadets for this program."
          onClose={() => setEnroll(false)}
        >
          <EnrollmentForm program={p} onDone={() => setEnroll(false)} />
        </Modal>
      )}
      {operation && (
        <Confirm
          title={`${operation.replaceAll('_', ' ')}?`}
          text={
            operation === 'complete'
              ? 'The program will be marked complete. Certificates will be queued only for cadets with explicit successful completion.'
              : operation === 'cancel'
                ? 'This program will stop accepting enrollments and progress changes.'
                : 'Confirm this program action to continue.'
          }
          onClose={() => setOperation('')}
          onConfirm={async () => {
            await api(`admin/programs/${id}/${operation}`, 'POST');
            await client.invalidateQueries();
            toast.success('Program action completed');
          }}
        />
      )}
    </>
  );
}
function EnrollmentForm({
  program,
  onDone,
}: {
  program: Program;
  onDone: () => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const students = useQuery({
    queryKey: ['assign-students', q, page],
    queryFn: () =>
      api<User[]>(
        `admin/students?active=true&q=${encodeURIComponent(q)}&page=${page}`,
      ),
  });
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api(`admin/programs/${program.id}/bulk_enrollments`, 'POST', {
            user_ids: selected,
            eligibility_confirmed: confirmed,
          });
          await client.invalidateQueries();
          toast.success('Cadets enrolled');
          onDone();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="form-note">
        <strong>Eligibility</strong>
        <p>{program.eligibility_criteria}</p>
      </div>
      <div className="search-input">
        <Search size={16} />
        <input
          aria-label="Search cadets to enroll"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search cadets…"
        />
      </div>
      {students.isPending ? (
        <Loading />
      ) : students.error ? (
        <ErrorState error={students.error} />
      ) : (
        <>
          <div className="student-select">
            {students.data.data.map((u) => (
              <label className="checkbox-row" key={u.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(u.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, u.id]
                        : selected.filter((id) => id !== u.id),
                    )
                  }
                />
                <span>
                  {u.name}
                  <small>{u.profile?.institution_name}</small>
                </span>
              </label>
            ))}
          </div>
          <Pagination
            page={page}
            total={students.data.meta.total || 0}
            onChange={setPage}
          />
        </>
      )}
      <label className="checkbox-row">
        <input
          type="checkbox"
          required
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        I confirm all selected cadets meet the eligibility requirements.
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Button variant="outline" type="button" onClick={onDone}>
          Cancel
        </Button>
        <Button disabled={busy || !selected.length || !confirmed}>
          Enroll {selected.length || ''} cadets
        </Button>
      </div>
    </form>
  );
}
export function EnrollmentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<Enrollment | null>(null);
  const [action, setAction] = useState<{ e: Enrollment; op: string } | null>(
    null,
  );
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['enrollments', page, status],
    queryFn: () =>
      api<Enrollment[]>(`admin/enrollments?page=${page}&status=${status}`),
  });
  return (
    <>
      <PageHeader
        eyebrow="TRAINING IN MOTION"
        title="Every cadet. Every milestone."
        description="Track progress and explicitly approve successful training completion."
        action={
          <Link to="/admin/programs" className="button button-primary">
            <Plus size={16} /> Assign through a program
          </Link>
        }
      />
      <div className="card">
        <div className="table-toolbar">
          <h2>Training enrollments</h2>
          <select
            aria-label="Filter enrollment status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {[
              'assigned',
              'in_progress',
              'completed',
              'failed',
              'withdrawn',
            ].map((s) => (
              <option key={s} value={s}>
                {s.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} />
        ) : !query.data.data.length ? (
          <Empty title="No enrollments found" />
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Cadet</th>
                    <th>Program</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <strong>{e.student_name}</strong>
                      </td>
                      <td>{e.program_title}</td>
                      <td className="progress-cell">
                        <Progress value={e.progress_percent} />
                      </td>
                      <td>
                        <Badge status={e.status} />
                      </td>
                      <td>
                        <div className="table-buttons">
                          {['assigned', 'in_progress'].includes(e.status) &&
                          e.program.status !== 'cancelled' ? (
                            <>
                              <button onClick={() => setEditing(e)}>
                                Update
                              </button>
                              {e.progress_percent === 100 && (
                                <button
                                  onClick={() =>
                                    setAction({ e, op: 'complete' })
                                  }
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => setAction({ e, op: 'fail' })}
                              >
                                Fail
                              </button>
                              <button
                                onClick={() => setAction({ e, op: 'withdraw' })}
                              >
                                Withdraw
                              </button>
                            </>
                          ) : e.status === 'completed' &&
                            e.program.status === 'completed' ? (
                            <button
                              onClick={() =>
                                setAction({ e, op: 'certificate' })
                              }
                            >
                              Issue / retry PDF
                            </button>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              total={query.data.meta.total || 0}
              onChange={setPage}
            />
          </>
        )}
      </div>
      {editing && (
        <Modal
          title={`Update ${editing.student_name}’s progress`}
          onClose={() => setEditing(null)}
        >
          <ProgressForm enrollment={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
      {action && (
        <Confirm
          title={`${action.op === 'complete' ? 'Approve completion' : action.op === 'certificate' ? 'Generate certificate' : action.op + ' enrollment'}?`}
          text="Confirm this administrative action. It will be recorded in the audit trail."
          onClose={() => setAction(null)}
          onConfirm={async () => {
            await api(`admin/enrollments/${action.e.id}/${action.op}`, 'POST');
            await client.invalidateQueries();
            toast.success('Enrollment action completed');
          }}
        />
      )}
    </>
  );
}
function ProgressForm({
  enrollment,
  onDone,
}: {
  enrollment: Enrollment;
  onDone: () => void;
}) {
  const [value, setValue] = useState(enrollment.progress_percent);
  const [remarks, setRemarks] = useState(enrollment.remarks || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const client = useQueryClient();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api(`admin/enrollments/${enrollment.id}/progress`, 'PATCH', {
            progress_percent: value,
            remarks,
          });
          await client.invalidateQueries();
          toast.success('Progress updated');
          onDone();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Progress: {value}%
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </label>
      <label>
        Administrative remarks
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </label>
      <p className="form-note">
        100% progress still requires explicit completion approval.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <Button disabled={busy}>Save progress</Button>
    </form>
  );
}
export function CertificatesPage({ student = false }: { student?: boolean }) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<{
    c: Certificate;
    op: string;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('');
  const client = useQueryClient();
  const prefix = student ? 'student' : 'admin';
  const query = useQuery({
    queryKey: ['certificates', prefix, page, status],
    queryFn: () =>
      api<Certificate[]>(
        `${prefix}/certificates?page=${page}&status=${status}`,
      ),
    refetchInterval: 15000,
  });
  return (
    <>
      <PageHeader
        eyebrow="ACHIEVEMENTS, RECOGNIZED"
        title={
          student
            ? 'Earned with effort. Yours to keep.'
            : 'Milestones that mean something.'
        }
        description={
          student
            ? 'View and download the completion certificates you’ve earned.'
            : 'Manage institutional completion certificates and their validity.'
        }
      />
      {!student && (
        <div className="filter-bar">
          <select
            aria-label="Certificate status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All certificates</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      )}
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : query.data.data.length ? (
        <>
          <div className="certificate-grid">
            {query.data.data.map((c) => (
              <section className="card certificate-card" key={c.id}>
                <div className="certificate-preview">
                  <div className="certificate-corners" />
                  <ShieldCheck size={28} />
                  <span>CERTIFICATE OF COMPLETION</span>
                  <strong>{c.student_name_snapshot}</strong>
                  <p>{c.program_title_snapshot}</p>
                  <div className="cert-signature">INSTITUTIONAL TRAINING</div>
                  <Award size={31} />
                </div>
                <div className="certificate-body">
                  <div className="section-header">
                    <h3>{c.program_title_snapshot}</h3>
                    <Badge status={c.status} />
                  </div>
                  <p>{c.certificate_number}</p>
                  <small>
                    Issued {formatDate(c.issued_at)} · {c.student_name_snapshot}
                  </small>
                  <div className="certificate-actions">
                    {c.status === 'active' && c.pdf_ready ? (
                      <a
                        className="button button-outline"
                        href={`/api/v1/${prefix}/certificates/${c.id}/download`}
                      >
                        <Download size={15} /> Download PDF
                      </a>
                    ) : (
                      <span className="muted">
                        {c.status === 'revoked'
                          ? 'Certificate revoked'
                          : `PDF ${c.generation_status}`}
                      </span>
                    )}
                    {!student && (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setReason('');
                            setSelected({
                              c,
                              op: c.status === 'active' ? 'revoke' : 'reissue',
                            });
                          }}
                        >
                          {c.status === 'active' ? 'Revoke' : 'Reissue'}
                        </Button>
                        {c.status === 'active' && (
                          <Button
                            variant="ghost"
                            onClick={() => setSelected({ c, op: 'reissue' })}
                          >
                            Reissue
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
          <Pagination
            page={page}
            total={query.data.meta.total || 0}
            onChange={setPage}
          />
        </>
      ) : (
        <Empty
          title={
            student
              ? 'Your achievements are ahead of you'
              : 'No certificates yet'
          }
          text="Certificates become available after successful cadet and program completion."
        />
      )}
      <p className="privacy-note">
        <ShieldCheck size={14} /> Institutional training completion
        certificates. These are not official NCC A/B/C certifications.
      </p>
      {selected && (
        <Confirm
          title={`${selected.op} certificate?`}
          text={
            selected.op === 'revoke'
              ? 'This certificate will no longer be available for valid downloads.'
              : 'A new certificate number and PDF will replace the previous issue. The change is recorded in the audit trail.'
          }
          onClose={() => setSelected(null)}
          onConfirm={async () => {
            if (selected.op === 'revoke' && !reason.trim())
              throw new Error('Please provide a revocation reason.');
            await api(
              `admin/certificates/${selected.c.id}/${selected.op}`,
              'POST',
              { reason },
            );
            await client.invalidateQueries();
            toast.success('Certificate updated');
          }}
        >
          {selected.op === 'revoke' && (
            <label>
              Reason
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
          )}
        </Confirm>
      )}
    </>
  );
}
export function Confirm({
  title,
  text,
  onClose,
  onConfirm,
  children,
}: {
  title: string;
  text: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  children?: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <Modal title={title} description={text} onClose={onClose}>
      {children}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Working…' : 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
}
export function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE CONFIGURATION"
        title="A well-run workspace."
        description="Operational settings for your institution’s training portal."
      />
      <div className="settings-grid">
        {[
          [
            ShieldCheck,
            'Security & access',
            'Role-based access, secure session cookies, and CSRF protection are enforced by the backend. Administrator accounts are provisioned through the server.',
          ],
          [
            BookOpen,
            'Organization & certificates',
            'Set ORGANIZATION_NAME and CERTIFICATE_SIGNATORY in your server environment to customize certificate text.',
          ],
          [
            Mail,
            'Invitations & recovery',
            'Configure SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, and MAILER_FROM for secure invitation delivery.',
          ],
          [
            Users,
            'Privacy & retention',
            'Aadhaar is not collected. Follow your institution’s approved retention policy and deactivate accounts to preserve training history.',
          ],
        ].map(([Icon, title, text]) => {
          const I = Icon as typeof ShieldCheck;
          return (
            <section className="card detail-card" key={String(title)}>
              <I size={25} />
              <h2>{String(title)}</h2>
              <p>{String(text)}</p>
            </section>
          );
        })}
      </div>
    </>
  );
}
