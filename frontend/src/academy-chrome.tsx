import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  MapPin,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from './auth';
export function MilitaryBrand() {
  return (
    <span className="mh-brand">
      <img
        className="mh-brand-emblem"
        src="/images/ncc-badge.png"
        alt="National Cadet Corps emblem"
        width={50}
        height={50}
      />
      <span>
        NCC OTA <span className="mh-brand-accent">GWALIOR</span>
        <small>Officers’ Training Academy</small>
      </span>
    </span>
  );
}

export function AcademyHeader({ about = false }: { about?: boolean }) {
  const [menu, setMenu] = useState(false);
  const { user } = useAuth();
  const certificatePath =
    user?.role === 'admin' ? '/admin/certificates' : '/student/certificates';
  return (
    <>
      {' '}
      <a className="mh-skip" href="#main-content">
        Skip to main content
      </a>
      <div className="mh-topbar">
        <div className="mh-container mh-topbar-inner">
          <span>
            <MapPin size={14} /> NCC OTA GWALIOR · MADHYA PRADESH
          </span>
          <span className="mh-top-motto">
            UNITY <i /> DISCIPLINE <i /> SERVICE
          </span>
          <Link to={certificatePath}>
            ACCESS YOUR CERTIFICATES <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
      <header className="mh-header mh-container">
        <Link to="/" aria-label="NCC OTA Gwalior home">
          <MilitaryBrand />
        </Link>
        <button
          className="mh-menu-toggle"
          aria-label={menu ? 'Close menu' : 'Open menu'}
          aria-expanded={menu}
          aria-controls="mh-navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
        <nav
          id="mh-navigation"
          className={menu ? 'mh-nav is-open' : 'mh-nav'}
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className={about ? undefined : 'is-current'}
            onClick={() => setMenu(false)}
          >
            HOME
          </Link>
          <Link
            to="/about"
            className={about ? 'is-current' : undefined}
            aria-current={about ? 'page' : undefined}
            onClick={() => setMenu(false)}
          >
            ABOUT US
          </Link>
          <a
            href={about ? '/#programs' : '#programs'}
            onClick={() => setMenu(false)}
          >
            PROGRAMS <ChevronDown size={12} />
          </a>
          <a
            href={about ? '/#gallery' : '#gallery'}
            onClick={() => setMenu(false)}
          >
            ACADEMY GALLERY
          </a>
          <Link to={certificatePath} onClick={() => setMenu(false)}>
            CERTIFICATES
          </Link>
          <Link to="/login" className="mh-nav-login">
            SIGN IN <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>
    </>
  );
}
export function AcademyFooter() {
  const { user } = useAuth();
  const certificatePath =
    user?.role === 'admin' ? '/admin/certificates' : '/student/certificates';
  return (
    <footer className="mh-footer">
      <div className="mh-container">
        <div className="mh-footer-main">
          <div>
            <Link to="/">
              <MilitaryBrand />
            </Link>
            <p>
              Building character through training.
              <br />
              Growing leaders through experience.
              <br />
              United by a purpose to serve.
            </p>
            <span className="mh-footer-motto">
              UNITY & DISCIPLINE <span>✦</span>
            </span>
          </div>
          <div>
            <h3>EXPLORE</h3>
            <Link to="/about">About the academy</Link>
            <a href="/#programs">Training programs</a>
            <a href="/#journey">The cadet journey</a>
            <a href="/#faq">Questions & answers</a>
          </div>
          <div>
            <h3>PARTICIPANT ACCESS</h3>
            <Link to="/login">
              Participant sign in <ArrowUpRight size={13} />
            </Link>
            <Link to="/login">
              Administrator sign in <ArrowUpRight size={13} />
            </Link>
            <Link to={certificatePath}>My certificates</Link>
            <Link to="/forgot-password">Password recovery</Link>
            <Link to="/home-classic">Classic homepage</Link>
          </div>
          <div className="mh-footer-statement">
            <ShieldCheck size={35} />
            <h3>LEAD WITH INTEGRITY.</h3>
            <p>
              Institutional training completion certificates are not official
              NCC A/B/C certificates.
            </p>
          </div>
        </div>
        <div className="mh-footer-bottom">
          <span>
            © {new Date().getFullYear()} NCC OTA Gwalior. Unity. Discipline.
            Service.
          </span>
          <span>PHOTOGRAPHY: NCC OTA GWALIOR & PIB</span>
          <a href="#top" aria-label="Back to top">
            BACK TO TOP <ArrowUp size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
