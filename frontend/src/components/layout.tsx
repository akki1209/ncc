import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Award,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  UserRound,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Brand } from './common';
import { useAuth } from '../auth';
const adminNav = [
  ['Dashboard', 'dashboard', LayoutDashboard],
  ['Students', 'students', Users],
  ['Programs', 'programs', BookOpen],
  ['Enrollments', 'enrollments', ClipboardList],
  ['Certificates', 'certificates', Award],
  ['Reports', 'reports', ChartNoAxesCombined],
] as const;
const studentNav = [
  ['Dashboard', 'dashboard', LayoutDashboard],
  ['My profile', 'profile', UserRound],
  ['My programs', 'programs', BookOpen],
  ['My certificates', 'certificates', Award],
] as const;
export function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const role = user?.role || 'admin';
  const nav = role === 'admin' ? adminNav : studentNav;
  const page = location.pathname.split('/')[2] || 'dashboard';
  return (
    <div className="app-layout">
      {open && (
        <button
          className="drawer-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <Link to="/" className="brand-link">
          <Brand />
        </Link>
        <button
          className="mobile-close icon-button"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <div className="workspace">
          <span className="workspace-icon">
            <ShieldCheck size={19} />
          </span>
          <div>
            Academy Workspace
            <small>
              {role === 'admin'
                ? 'Administrator workspace'
                : 'Participant workspace'}
            </small>
          </div>
          <ChevronRight size={14} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map(([label, path, Icon]) => (
            <NavLink
              key={path}
              to={`/${role}/${path}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {path === 'dashboard' && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-icon">✦</div>
            <strong>Building tomorrow’s leaders.</strong>
            <p>
              Your programs. Your achievements.
              <br />A stronger nation.
            </p>
            <Link to="/about">
              Our mission <ArrowUpRight size={14} />
            </Link>
          </div>
          {role === 'admin' && (
            <NavLink className="settings-link" to="/admin/settings">
              <Settings size={18} /> Settings
            </NavLink>
          )}
          <button
            className="logout"
            onClick={() => void logout().catch(() => {})}
          >
            <LogOut size={18} /> Sign out
          </button>
          <div className="sidebar-copyright">
            NCC OTA GWALIOR
            <br />
            Unity. Discipline. Service.
          </div>
        </div>
      </aside>
      <div className="main-column">
        <header className="app-header">
          <div className="breadcrumb">
            <button
              className="icon-button menu-toggle"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <span>
              {role === 'admin' ? 'Admin workspace' : 'Participant account'}
            </span>
            <ChevronRight size={14} />
            <b>{page.replaceAll('-', ' ')}</b>
          </div>
          <div className="header-right">
            <span className="secure-label">
              <span /> Secure workspace
            </span>
            <div className="header-divider" />
            <div className="avatar">
              {user?.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="user-label">
              <strong>{user?.name}</strong>
              <small>
                {role === 'admin' ? 'Administrator' : 'Participant'}
              </small>
            </div>
          </div>
        </header>
        <main key={location.pathname}>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>© {new Date().getFullYear()} NCC Academy Workspace</span>
          <span>
            <ShieldCheck size={13} /> Designed for service. Built for progress.
          </span>
        </footer>
      </div>
    </div>
  );
}
