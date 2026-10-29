import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Award, CalendarDays, MapPin, ShieldCheck } from 'lucide-react';
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
import type { Enrollment, User } from './types';
export function StudentPrograms() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['my-programs', page],
    queryFn: () => api<Enrollment[]>(`student/programs?page=${page}`),
  });
  return (
    <>
      <PageHeader
        eyebrow="LEARNING WITH PURPOSE"
        title="Your next chapter starts here."
        description="Explore your assigned programs and follow your training progress."
      />
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : query.data.data.length ? (
        <>
          <div className="program-grid">
            {query.data.data.map((e) => (
              <ProgramCard program={e.program} key={e.id}>
                <Link to={`/student/programs/${e.id}`}>View training →</Link>
              </ProgramCard>
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
          title="No programs assigned yet"
          text="Your administrator will assign your training opportunities."
        />
      )}
    </>
  );
}
export function StudentProgramDetail() {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ['my-program', id],
    queryFn: () => api<Enrollment>(`student/programs/${id}`),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorState error={query.error} />;
  const e = query.data.data;
  return (
    <>
      <Link className="back-link" to="/student/programs">
        ← My programs
      </Link>
      <PageHeader
        eyebrow="YOUR TRAINING JOURNEY"
        title={e.program_title}
        description={e.program.short_description}
      />
      <div className="detail-grid">
        <div className="card detail-card">
          <Badge status={e.program.status} />
          <h2>About your training</h2>
          <p>{e.program.description}</p>
          <dl>
            <div>
              <dt>
                <CalendarDays size={15} /> Training dates
              </dt>
              <dd>
                {formatDate(e.program.start_date)} –{' '}
                {formatDate(e.program.end_date)}
              </dd>
            </div>
            <div>
              <dt>
                <MapPin size={15} /> Location
              </dt>
              <dd>{e.program.location}</dd>
            </div>
          </dl>
          <h3>Eligibility</h3>
          <p>{e.program.eligibility_criteria}</p>
        </div>
        <div className="card detail-card">
          <Award size={35} color="#b79b58" />
          <h2>Every step counts.</h2>
          <Badge status={e.status} />
          <div className="large-progress">
            <strong>
              {e.progress_percent}
              <small>%</small>
            </strong>
            <Progress value={e.progress_percent} />
          </div>
          <p>
            {e.status === 'completed'
              ? 'Your successful completion has been approved. Well done!'
              : 'Your administrator updates progress after training assessments. Keep showing up.'}
          </p>
          {e.remarks && (
            <div className="form-note">
              <h3>Training remarks</h3>
              <p>{e.remarks}</p>
            </div>
          )}
          <Link className="button button-outline" to="/student/certificates">
            My certificates →
          </Link>
        </div>
      </div>
    </>
  );
}
export function ProfilePage() {
  const query = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api<User>('student/profile'),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorState error={query.error} />;
  return (
    <>
      <PageHeader
        eyebrow="THE PERSON BEHIND THE PROGRESS"
        title="Your profile. Your identity."
        description="Keep your contact details current so your institution can stay connected."
      />
      <ProfileForm user={query.data.data} />
    </>
  );
}
function ProfileForm({ user }: { user: User }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const client = useQueryClient();
  const p = user.profile;
  return (
    <form
      className="card profile-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const fields = Object.fromEntries(new FormData(e.currentTarget));
        setBusy(true);
        setError('');
        try {
          const profile = {
            ...fields,
            height_cm: fields.height_cm || null,
            weight_kg: fields.weight_kg || null,
          };
          await api('student/profile', 'PATCH', { profile });
          await client.invalidateQueries();
          toast.success('Your profile has been updated.');
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="profile-banner">
        <span className="avatar large">
          {user.name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')}
        </span>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
        <Badge status="active" />
      </div>
      <h3>Personal information</h3>
      <p className="muted">
        Your institution manages your enrollment and academic details.
      </p>
      <div className="form-grid">
        <label>
          Full name
          <input name="full_name" required defaultValue={p?.full_name} />
        </label>
        <label>
          Mobile number
          <input
            name="mobile_number"
            required
            type="tel"
            pattern="\+?[1-9][0-9]{9,14}"
            defaultValue={p?.mobile_number}
          />
        </label>
        <label>
          Blood group
          <select name="blood_group" defaultValue={p?.blood_group || ''}>
            <option value="">Not provided</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Height (cm, optional)
          <input
            name="height_cm"
            type="number"
            min={51}
            max={250}
            step="0.1"
            defaultValue={p?.height_cm}
          />
        </label>
        <label>
          Weight (kg, optional)
          <input
            name="weight_kg"
            type="number"
            min={16}
            max={300}
            step="0.1"
            defaultValue={p?.weight_kg}
          />
        </label>
        <label>
          Institution
          <input readOnly value={p?.institution_name || ''} />
        </label>
        <label>
          Course / class
          <input readOnly value={p?.course_or_class || ''} />
        </label>
        <label>
          Date of birth
          <input readOnly value={p?.date_of_birth || ''} />
        </label>
      </div>
      <div className="form-note">
        <ShieldCheck size={17} /> Your information is accessible only to you and
        authorized administrators. Aadhaar is not collected.
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Button disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</Button>
      </div>
    </form>
  );
}
