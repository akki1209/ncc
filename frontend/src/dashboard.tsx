import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  BookOpen,
  Award,
  ClipboardList,
  Plus,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  CheckCircle2,
  Flag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { api } from './api';
import { useAuth } from './auth';
import {
  Badge,
  Empty,
  ErrorState,
  Loading,
  PageHeader,
  ProgramCard,
  Progress,
  StatCard,
  formatDate,
} from './components/common';
import type { Dashboard, Program, StudentDashboard } from './types';
export function AdminDashboard({ reports = false }: { reports?: boolean }) {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api<Dashboard>('admin/dashboard'),
  });
  const programs = useQuery({
    queryKey: ['dashboard-programs'],
    queryFn: () => api<Program[]>('admin/programs?per_page=3&status=ongoing'),
  });
  if (query.isPending) return <Loading />;
  if (query.error)
    return (
      <ErrorState error={query.error} retry={() => void query.refetch()} />
    );
  const d = query.data.data;
  return (
    <>
      <PageHeader
        eyebrow={reports ? 'INSIGHTS & ANALYTICS' : 'YOUR COMMAND CENTRE'}
        title={
          reports
            ? 'A clearer picture of progress.'
            : `Welcome back, ${user?.name.split(' ')[0]}.`
        }
        description={
          reports
            ? 'Track participation, completion, and achievements across your programs.'
            : 'Here’s what’s happening across your camps and cadets today.'
        }
        action={
          <Link className="button button-primary" to="/admin/students?new=1">
            <Plus size={17} /> Register student
          </Link>
        }
      />
      <div className="date-line">
        <CalendarDays size={15} />
        {new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        <span>•</span>
        <span>Make every training day count.</span>
      </div>
      <div className="stats-grid">
        <StatCard
          title="Total students"
          value={d.students}
          icon={<Users size={20} />}
          subtitle={`${d.active_students} active cadets`}
        />
        <StatCard
          title="Active programs"
          value={d.ongoing_programs}
          icon={<BookOpen size={20} />}
          subtitle={`${d.programs} programs in total`}
        />
        <StatCard
          title="Total enrollments"
          value={d.enrollments}
          icon={<ClipboardList size={20} />}
          subtitle="Across all training programs"
        />
        <StatCard
          title="Certificates issued"
          value={d.certificates}
          icon={<Award size={20} />}
          subtitle={`${d.completed} successful completions`}
        />
      </div>
      {!reports && (
        <section className="welcome-banner">
          <div className="banner-icon">
            <Flag size={32} strokeWidth={1.3} />
          </div>
          <div>
            <span>SMALL STEPS. STRONGER LEADERS.</span>
            <h2>Every cadet’s journey starts with an opportunity.</h2>
            <p>
              Create meaningful training experiences. Inspire the next
              generation.
            </p>
          </div>
          <Link to="/admin/programs?new=1">
            Create a program <ArrowUpRight size={17} />
          </Link>
          <div className="banner-decoration">✦</div>
        </section>
      )}
      <div className="dashboard-middle">
        <section className="card chart-card">
          <div className="section-header">
            <div>
              <h2>Training overview</h2>
              <p>Enrollment and completion across programs</p>
            </div>
            <div className="chart-legend">
              <span>
                <i />
                Enrolled
              </span>
              <span>
                <i />
                Completed
              </span>
            </div>
          </div>
          {d.program_stats.length ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={d.program_stats}
                  margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                  barGap={5}
                >
                  <CartesianGrid
                    strokeDasharray="3 5"
                    vertical={false}
                    stroke="#e9edeb"
                  />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(name) =>
                      String(name).split(' ').slice(0, 2).join(' ')
                    }
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#78847d' }}
                    dy={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#78847d' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e5e9e7',
                    }}
                  />
                  <Bar
                    isAnimationActive={false}
                    dataKey="enrolled"
                    name="Enrolled"
                    fill="#234f3d"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    isAnimationActive={false}
                    dataKey="completed"
                    name="Completed"
                    fill="#bac8a4"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty title="Your overview starts here" />
          )}
          <div className="chart-footer">
            <span>
              <span className="green-dot" />
              Live program data
            </span>
            <Link to="/admin/reports">
              View report <ArrowRight size={14} />
            </Link>
          </div>
        </section>
        <section className="card activity-card">
          <div className="section-header">
            <div>
              <h2>Recent activity</h2>
              <p>The latest from your workspace</p>
            </div>
            <span className="live-badge">LIVE</span>
          </div>
          {d.recent_activity.length ? (
            <div className="activity-list">
              {d.recent_activity.slice(0, 5).map((a) => (
                <div className="activity" key={a.id}>
                  <div
                    className={`activity-icon ${a.action.includes('certificate') ? 'gold' : ''}`}
                  >
                    {a.action.includes('certificate') ? (
                      <Award size={16} />
                    ) : a.action.includes('student') ? (
                      <Users size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                  </div>
                  <div>
                    <strong>
                      {a.action.replaceAll('.', ' ').replaceAll('_', ' ')}
                    </strong>
                    <p>{a.actor}</p>
                  </div>
                  <time>{formatDate(a.created_at)}</time>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="Ready for your first action"
              text="Workspace activity will appear here."
            />
          )}
          <div className="activity-bottom">
            <ShieldNote />
          </div>
        </section>
      </div>
      {reports ? (
        <div className="stats-grid">
          <StatCard
            title="Completed enrollments"
            value={d.completed}
            icon={<CheckCircle2 />}
            subtitle="Explicitly approved by an admin"
          />
          <StatCard
            title="Pending certificates"
            value={d.pending_certificates}
            icon={<Award />}
            subtitle="Qualifying enrollments awaiting issuance"
          />
          <StatCard
            title="Generation failures"
            value={d.failed_certificates}
            icon={<Award />}
            subtitle="Retry through program generation"
          />
          <StatCard
            title="Revoked certificates"
            value={d.revoked_certificates}
            icon={<Award />}
            subtitle="Excluded from valid downloads"
          />
        </div>
      ) : (
        <section className="programs-section">
          <div className="section-header">
            <div>
              <h2>
                Ongoing programs{' '}
                <span className="count-pill">{d.ongoing_programs}</span>
              </h2>
              <p>Training in motion. Potential in the making.</p>
            </div>
            <Link to="/admin/programs">
              View all programs <ArrowRight size={16} />
            </Link>
          </div>
          {programs.isPending ? (
            <Loading />
          ) : programs.error ? (
            <ErrorState error={programs.error} />
          ) : programs.data?.data.length ? (
            <div className="program-grid">
              {programs.data.data.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          ) : (
            <Empty
              title="No ongoing programs"
              text="Publish and start a program to see it here."
            />
          )}
        </section>
      )}
    </>
  );
}
function ShieldNote() {
  return (
    <span>
      <CheckCircle2 size={14} /> Every milestone, securely recorded.
    </span>
  );
}
export function StudentDashboardPage() {
  const query = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api<StudentDashboard>('student/dashboard'),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorState error={query.error} />;
  const d = query.data.data;
  const ongoing = d.enrollments.filter((e) =>
    ['assigned', 'in_progress'].includes(e.status),
  );
  return (
    <>
      <PageHeader
        eyebrow="YOUR CADET JOURNEY"
        title={`Keep moving forward, ${d.name.split(' ')[0]}.`}
        description="Every session is a step toward a stronger, more confident you."
      />
      <div className="stats-grid">
        <StatCard
          title="My programs"
          value={d.enrollments.length}
          icon={<BookOpen />}
          subtitle="Opportunities to learn and lead"
        />
        <StatCard
          title="In progress"
          value={ongoing.length}
          icon={<Flag />}
          subtitle="Keep the momentum going"
        />
        <StatCard
          title="Completed"
          value={d.enrollments.filter((e) => e.status === 'completed').length}
          icon={<CheckCircle2 />}
          subtitle="Milestones worth celebrating"
        />
        <StatCard
          title="My certificates"
          value={d.certificates}
          icon={<Award />}
          subtitle="Your achievements, recognized"
        />
      </div>
      <section className="welcome-banner">
        <div className="banner-icon">
          <Award size={34} />
        </div>
        <div>
          <span>DISCIPLINE TODAY. LEADERSHIP TOMORROW.</span>
          <h2>Your next milestone is within reach.</h2>
          <p>Show up, stay focused, and make every training session count.</p>
        </div>
        <Link to="/student/certificates">
          My achievements <ArrowRight size={16} />
        </Link>
      </section>
      <div className="section-header">
        <div>
          <h2>My training programs</h2>
          <p>Your assignments and latest training progress</p>
        </div>
        <Link to="/student/programs">
          View all <ArrowRight size={15} />
        </Link>
      </div>
      {d.enrollments.length ? (
        <div className="program-grid">
          {d.enrollments.slice(0, 6).map((e) => (
            <ProgramCard program={e.program} key={e.id}>
              <Link to={`/student/programs/${e.id}`}>
                My progress <ArrowRight size={14} />
              </Link>
            </ProgramCard>
          ))}
        </div>
      ) : (
        <Empty
          title="Your journey is about to begin"
          text="Your administrator will assign your training programs."
        />
      )}
      <section className="card progress-section">
        <h2>Progress at a glance</h2>
        {d.enrollments.map((e) => (
          <div className="progress-row" key={e.id}>
            <div>
              <h3>{e.program_title}</h3>
              <Badge status={e.status} />
            </div>
            <Progress value={e.progress_percent} />
          </div>
        ))}
        <Link to="/student/certificates" className="inline-link">
          <Download size={15} /> View and download your certificates
        </Link>
      </section>
    </>
  );
}
