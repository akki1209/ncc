import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Flag,
  MapPin,
  Mountain,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { api } from './api';
import { useAuth } from './auth';
import type { Program } from './types';
import { Modal } from './components/ui/dialog';
import './military-home.css';
import { AcademyHeader, AcademyFooter } from './academy-chrome';

const academyPhotos = [
  {
    src: '/images/ota-gwalior-march.jpg',
    alt: 'Women officers marching at NCC Officers Training Academy, Gwalior',
    title: 'Passing out parade',
    source: 'https://x.com/OTAGwalior/status/1540251201568219136',
    credit: 'NCC OTA Gwalior',
  },
  {
    src: '/images/ota-gwalior-parade.jpg',
    alt: 'NCC trainees on the parade ground in front of the OTA Gwalior academy building',
    title: 'Unity on the parade ground',
    source: 'https://x.com/OTAGwalior/status/1390948305928998912',
    credit: 'NCC OTA Gwalior',
  },
  {
    src: '/images/ota-gwalior-training.jpg',
    alt: 'Pre-commission training in the grounds of OTA Gwalior',
    title: 'Training with purpose',
    source: 'https://x.com/HQ_DG_NCC/status/1363083850881015813',
    credit: 'National Cadet Corps',
  },
];
const slides = [
  {
    label: 'CHARACTER. COURAGE. COMMITMENT.',
    first: 'FORGING CHARACTER.',
    accent: 'BUILDING',
    last: 'TOMORROW.',
    body: 'Welcome to NCC OTA Gwalior. Explore affiliation programs, follow your learning journey, and access your certificates through your personal account.',
    action: 'VIEW MY CERTIFICATES',
    href: '/student/certificates',
  },
  {
    label: 'ONE TEAM. A SHARED PURPOSE.',
    first: 'STRONGER TOGETHER.',
    accent: 'READY FOR',
    last: 'WHAT’S NEXT.',
    body: 'Step beyond the classroom. Find your confidence in the field, build lasting camaraderie, and learn what it means to lead by example.',
    action: 'DISCOVER OUR MISSION',
    href: '/about',
  },
  {
    label: 'EVERY MILESTONE MATTERS.',
    first: 'SHOW UP WITH PRIDE.',
    accent: 'LEAVE YOUR',
    last: 'MARK.',
    body: 'Follow your training, celebrate your progress, and carry every achievement forward with your own connected cadet workspace.',
    action: 'ACCESS MY ACCOUNT',
    href: '/login',
  },
];
const pillars = [
  {
    icon: ShieldCheck,
    title: 'DISCIPLINE & DRILL',
    description:
      'Build focus, precision, and self-belief through structured practice and shared standards.',
    number: '01',
  },
  {
    icon: Compass,
    title: 'LEADERSHIP IN ACTION',
    description:
      'Learn to take initiative, make thoughtful decisions, and bring out the best in your team.',
    number: '02',
  },
  {
    icon: Mountain,
    title: 'ADVENTURE & FITNESS',
    description:
      'Challenge your limits, build resilience, and discover your potential beyond the familiar.',
    number: '03',
  },
];
const questions = [
  [
    'How do I join a training program?',
    'Your institution’s administrator registers your account, confirms your eligibility, and assigns suitable programs. Contact your institution to begin your cadet journey.',
  ],
  [
    'How do I access the cadet portal?',
    'Use the secure invitation sent to your registered email to set your password. You can then sign in to view your assigned programs, update permitted profile details, and track your progress.',
  ],
  [
    'Where can I see my training progress?',
    'Your dashboard and My Programs pages show the latest progress recorded by your administrator. Successful completion requires explicit approval, even when progress reaches 100%.',
  ],
  [
    'When will my certificate become available?',
    'After both your successful completion and the program’s completion are approved, eligible certificates are generated and appear in My Certificates. These are institutional training completion certificates, not official NCC A/B/C certificates.',
  ],
];
function ActionLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = `mh-action ${className}`;
  return href.startsWith('#') ? (
    <a className={cls} href={href}>
      {children}
      <ArrowUpRight size={18} />
    </a>
  ) : (
    <Link className={cls} to={href}>
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function MilitaryHome() {
  const { user } = useAuth();
  const certificatePath =
    user?.role === 'admin' ? '/admin/certificates' : '/student/certificates';
  const [slide, setSlide] = useState(0);
  const [journey, setJourney] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const programs = useQuery({
    queryKey: ['public-programs'],
    queryFn: () => api<Program[]>('public/programs'),
  });
  const current = slides[slide];
  useEffect(() => {
    document.title = 'NCC OTA Gwalior | Officers’ Training Academy';
    return () => {
      document.title = 'NCC OTA Gwalior | Officers’ Training Academy';
    };
  }, []);
  return (
    <div className="military-home" id="top">
      <AcademyHeader />
      <main id="main-content">
        <section className="mh-hero" aria-label="Welcome to NCC OTA Gwalior">
          <div className="mh-hero-grid mh-container">
            <div className="mh-hero-visual">
              <div className="mh-hero-word" aria-hidden="true">
                OTA GWALIOR
              </div>
              <div className="mh-hero-disc" />
              <div className="mh-coordinate" aria-hidden="true">
                एकता और अनुशासन / UNITY & DISCIPLINE
              </div>
              <img
                className="mh-cadet"
                src={academyPhotos[slide].src}
                alt={academyPhotos[slide].alt}
                fetchPriority="high"
              />
              <a
                className="mh-photo-source"
                href={academyPhotos[slide].source}
                target="_blank"
                rel="noreferrer"
              >
                PHOTO: {academyPhotos[slide].credit.toUpperCase()}{' '}
                <ArrowUpRight size={11} />
              </a>
              <div className="mh-hero-badge">
                <ShieldCheck size={39} />
                <div>
                  LEAD WITH
                  <br />
                  <strong>PURPOSE</strong>
                </div>
                <span>UNITY & DISCIPLINE</span>
              </div>
              <div className="mh-visual-caption">
                <span /> NCC OFFICERS’ TRAINING ACADEMY · GWALIOR
              </div>
            </div>
            <div className="mh-hero-copy" key={slide} aria-live="polite">
              <div className="mh-kicker">
                <span /> {current.label}
              </div>
              <h1>
                {current.first}
                <br />
                <span>{current.accent}</span>
                <br />
                {current.last}
              </h1>
              <p>{current.body}</p>
              <ActionLink
                href={
                  current.href === '/student/certificates'
                    ? certificatePath
                    : current.href
                }
              >
                {current.action}
              </ActionLink>
              <div className="mh-hero-meta">
                <ShieldCheck size={19} />
                <span>
                  TRAIN WITH PURPOSE.
                  <br />
                  <b>GROW THROUGH EXPERIENCE.</b>
                </span>
              </div>
            </div>
          </div>
          <button
            className="mh-slider-arrow mh-prev"
            aria-label="Previous slide"
            onClick={() => setSlide((slide + 2) % 3)}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="mh-slider-arrow mh-next"
            aria-label="Next slide"
            onClick={() => setSlide((slide + 1) % 3)}
          >
            <ChevronRight size={22} />
          </button>
          <div className="mh-hero-bottom mh-container">
            <a href="#about">
              SCROLL TO EXPLORE <ArrowDown size={13} />
            </a>
            <div className="mh-slider-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={slide === index ? 'active' : ''}
                  aria-label={`Show slide ${index + 1}`}
                  aria-pressed={slide === index}
                  onClick={() => setSlide(index)}
                >
                  <span>0{index + 1}</span>
                </button>
              ))}
            </div>
            <span className="mh-hero-bottom-label">
              COURAGE STARTS WITH A SINGLE STEP.
            </span>
          </div>
        </section>
        <div className="mh-values-strip">
          <div>
            DISCIPLINE <span>✦</span> LEADERSHIP <span>✦</span> CAMARADERIE{' '}
            <span>✦</span> SERVICE <span>✦</span> ADVENTURE <span>✦</span>{' '}
            DISCIPLINE <span>✦</span> LEADERSHIP <span>✦</span>
          </div>
        </div>
        <section className="mh-section mh-container" id="about">
          <div className="mh-section-top">
            <div>
              <div className="mh-kicker">
                <span /> MORE THAN TRAINING
              </div>
              <h2>
                BUILT ON VALUES.
                <br />
                DRIVEN BY <span>PURPOSE.</span>
              </h2>
            </div>
            <p>
              We create space for cadets to learn, challenge themselves, and
              grow together. Real experiences. Shared responsibility. A
              commitment to becoming better, every day.
            </p>
          </div>
          <div className="mh-pillar-grid">
            {pillars.map(({ icon: Icon, title, description, number }) => (
              <article className="mh-pillar" key={title}>
                <div className="mh-pillar-top">
                  <Icon size={43} strokeWidth={1.3} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="#programs">
                  EXPLORE TRAINING <ArrowRight size={17} />
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="mh-about mh-container" id="journey">
          <div className="mh-about-photo">
            <img
              src="/images/ota-gwalior-parade.jpg"
              alt="Women NCC trainees on the parade ground at OTA Gwalior"
              loading="lazy"
            />
            <div className="mh-photo-label">
              THE GREATEST JOURNEYS
              <br />
              <strong>ARE SHARED.</strong>
            </div>
            <button
              className="mh-play"
              aria-label="Explore the cadet journey"
              onClick={() => setJourney(true)}
            >
              <BookOpen size={24} />
            </button>
            <span className="mh-photo-frame" />
          </div>
          <div className="mh-about-copy">
            <div className="mh-kicker">
              <span /> YOUR JOURNEY. YOUR POTENTIAL.
            </div>
            <h2>
              NO CHALLENGE TOO BIG.
              <br />
              NO STEP <span>TOO SMALL.</span>
            </h2>
            <p>
              Leadership isn’t built in a single moment. It grows through
              showing up, looking out for your team, and choosing to go a little
              further.
            </p>
            <div className="mh-about-points">
              <div>
                <Check size={17} />
                <span>Structured training with clear milestones</span>
              </div>
              <div>
                <Check size={17} />
                <span>A connected, personal cadet workspace</span>
              </div>
              <div>
                <Check size={17} />
                <span>Progress and achievements you can follow</span>
              </div>
            </div>
            <ActionLink href="/login">START YOUR JOURNEY</ActionLink>
            <span className="mh-about-watermark" aria-hidden="true">
              SERVE.
            </span>
          </div>
        </section>
        <section className="mh-programs-section" id="programs">
          <div className="mh-container">
            <div className="mh-section-top">
              <div>
                <div className="mh-kicker">
                  <span /> AFFILIATION PROGRAMS
                </div>
                <h2>
                  REAL CHALLENGES.
                  <br />
                  LASTING <span>CONFIDENCE.</span>
                </h2>
              </div>
              <p>
                Explore affiliation programs and institutional learning
                opportunities. Your administrator confirms eligibility, manages
                enrollment, and records successful completion.
              </p>
            </div>
            {programs.isPending ? (
              <div className="mh-loading" role="status">
                Loading training opportunities…
              </div>
            ) : programs.error ? (
              <div className="mh-notice">
                <h3>TRAINING OPPORTUNITIES</h3>
                <p>Programs are temporarily unavailable. Please try again.</p>
                <button onClick={() => void programs.refetch()}>
                  RETRY <ArrowRight size={15} />
                </button>
              </div>
            ) : programs.data?.data.length ? (
              <div className="mh-program-grid">
                {programs.data.data.slice(0, 6).map((program, index) => (
                  <article className="mh-program" key={program.id}>
                    <div className="mh-program-image">
                      <img
                        src={
                          [
                            '/images/ota-gwalior-training.jpg',
                            '/images/ota-gwalior-march.jpg',
                            '/images/ota-gwalior-parade.jpg',
                          ][index % 3]
                        }
                        alt=""
                        loading="lazy"
                      />
                      <span>OTA GWALIOR · ARCHIVE PHOTOGRAPH</span>
                      <button
                        aria-label={`View ${program.title}`}
                        onClick={() => setSelectedProgram(program)}
                      >
                        <ArrowUpRight size={23} />
                      </button>
                    </div>
                    <div className="mh-program-body">
                      <span className="mh-program-category">
                        INSTITUTIONAL TRAINING
                      </span>
                      <h3>
                        <button onClick={() => setSelectedProgram(program)}>
                          {program.title}
                        </button>
                      </h3>
                      <p>{program.short_description}</p>
                      <div>
                        <MapPin size={14} />
                        {program.location}
                      </div>
                      <button
                        className="mh-text-link"
                        onClick={() => setSelectedProgram(program)}
                      >
                        EXPLORE PROGRAM <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mh-notice">
                <h3>THE NEXT OPPORTUNITY IS AHEAD.</h3>
                <p>
                  Published programs will appear here. Contact your institution
                  about upcoming training.
                </p>
              </div>
            )}
            <p className="mh-program-note">
              Program examples are institutional offerings and do not imply
              official NCC approval.
            </p>
          </div>
        </section>
        <section
          className="mh-section mh-container mh-academy-gallery"
          id="gallery"
        >
          <div className="mh-section-top">
            <div>
              <div className="mh-kicker">
                <span /> FROM THE ACADEMY
              </div>
              <h2>
                OTA GWALIOR.
                <br />
                <span>UNITY IN ACTION.</span>
              </h2>
            </div>
            <p>
              Moments from NCC Officers’ Training Academy, Gwalior. Academy
              photographs are credited to their original NCC and PIB
              publications.
            </p>
          </div>
          <div className="mh-academy-grid">
            {[
              ...academyPhotos,
              {
                src: '/images/ota-gwalior-jubilee.jpg',
                alt: 'Presentation of the championship banner at the Diamond Jubilee passing out parade, OTA Gwalior',
                title: 'Diamond Jubilee · September 2025',
                source:
                  'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2168523',
                credit: 'Press Information Bureau',
              },
            ].map((photo) => (
              <figure key={photo.src}>
                <img src={photo.src} alt={photo.alt} loading="lazy" />
                <figcaption>
                  <span>{photo.title}</span>
                  <a href={photo.source} target="_blank" rel="noreferrer">
                    {photo.credit}
                    <ArrowUpRight size={13} />
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section className="mh-manifesto">
          <div className="mh-container">
            <Flag size={40} strokeWidth={1.2} />
            <span className="mh-kicker">ONE TEAM. ONE SHARED SPIRIT.</span>
            <h2>
              STRENGTH IN UNITY.
              <br />
              <span>PRIDE IN SERVICE.</span>
            </h2>
            <p>
              Be ready to learn. Be willing to lead. Be someone your team can
              count on.
            </p>
            <ActionLink href="/login">STEP INTO YOUR POTENTIAL</ActionLink>
          </div>
          <span className="mh-manifesto-star" aria-hidden="true">
            ✦
          </span>
        </section>
        <section className="mh-section mh-container mh-faq-section" id="faq">
          <div className="mh-faq-heading">
            <div className="mh-kicker">
              <span /> KNOW BEFORE YOU GO
            </div>
            <h2>
              A CLEAR PATH.
              <br />A CONFIDENT
              <br />
              <span>FIRST STEP.</span>
            </h2>
            <p>Everything you need to get started with your training portal.</p>
            <Link to="/login">
              ALREADY A CADET? SIGN IN <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="mh-faq-list">
            {questions.map(([question, answer], index) => (
              <div
                className={`mh-faq-item ${faq === index ? 'is-open' : ''}`}
                key={question}
              >
                <h3>
                  <button
                    aria-expanded={faq === index}
                    aria-controls={`mh-faq-answer-${index}`}
                    onClick={() => setFaq(faq === index ? null : index)}
                  >
                    <span>0{index + 1}</span>
                    {question}
                    <span className="mh-faq-toggle">
                      {faq === index ? '−' : '+'}
                    </span>
                  </button>
                </h3>
                <div id={`mh-faq-answer-${index}`} hidden={faq !== index}>
                  <p>{answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="mh-cta mh-container">
          <div>
            <div className="mh-kicker">YOUR ACHIEVEMENTS. IN ONE PLACE.</div>
            <h2>
              SHOW UP. STAND TALL.
              <br />
              MAKE IT <span>COUNT.</span>
            </h2>
          </div>
          <ActionLink href={certificatePath} className="mh-action-light">
            VIEW MY CERTIFICATES
          </ActionLink>
          <Target
            size={180}
            className="mh-cta-target"
            strokeWidth={0.5}
            aria-hidden="true"
          />
        </section>
      </main>
      <AcademyFooter />
      {journey && (
        <Modal
          title="Your cadet journey"
          description="A clear path from your first invitation to your next achievement."
          onClose={() => setJourney(false)}
        >
          <ol className="mh-journey-steps">
            {[
              [
                Users,
                'Get invited',
                'Your administrator creates your account and sends a secure password setup link.',
              ],
              [
                Compass,
                'Find your direction',
                'Your institution confirms your eligibility and assigns your training programs.',
              ],
              [
                Target,
                'Keep moving forward',
                'Follow progress and milestones recorded by your administrator.',
              ],
              [
                Award,
                'Celebrate achievement',
                'After successful completion, download your institutional training certificates.',
              ],
            ].map(([Icon, title, description]) => {
              const I = Icon as typeof Users;
              return (
                <li key={String(title)}>
                  <I size={22} />
                  <div>
                    <h3>{String(title)}</h3>
                    <p>{String(description)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <Link
            className="button button-primary"
            to="/login"
            onClick={() => setJourney(false)}
          >
            Go to the portal <ArrowRight size={16} />
          </Link>
        </Modal>
      )}
      {selectedProgram && (
        <Modal
          title={selectedProgram.title}
          description="Institutional training program"
          onClose={() => setSelectedProgram(null)}
        >
          <div className="mh-program-detail">
            <p>{selectedProgram.short_description}</p>
            <p>
              <MapPin size={16} />
              {selectedProgram.location}
            </p>
            <p>
              {new Date(selectedProgram.start_date).toLocaleDateString(
                'en-IN',
                { day: 'numeric', month: 'long', year: 'numeric' },
              )}{' '}
              –{' '}
              {new Date(selectedProgram.end_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <h3>Eligibility requirements</h3>
            <p>
              {selectedProgram.eligibility_criteria ||
                'Your institution will confirm your eligibility before enrollment.'}
            </p>
            <p className="form-note">
              Program assignments are managed by your institution. Sign in to
              see programs assigned to you.
            </p>
            <Link
              className="button button-primary"
              to="/login"
              onClick={() => setSelectedProgram(null)}
            >
              Sign in to your portal <ArrowRight size={16} />
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}
