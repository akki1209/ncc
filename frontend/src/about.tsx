import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  ChevronRight,
  Flag,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AcademyHeader, AcademyFooter } from './academy-chrome';
import { useAuth } from './auth';
import './military-home.css';
import './about.css';

const sources = {
  academy: 'https://nccotagwalior.org/',
  jubilee: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2168523',
  dg: 'https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2322772&lang=1&reg=3',
  appointment:
    'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2173448&lang=2&reg=3',
};
export function AcademyAbout() {
  const { user } = useAuth();
  const certificates =
    user?.role === 'admin' ? '/admin/certificates' : '/student/certificates';
  useEffect(() => {
    document.title = 'About Us | NCC OTA Gwalior';
    const section = document.getElementById(window.location.hash.slice(1));
    if (section) section.scrollIntoView();
    else window.scrollTo(0, 0);
  }, []);
  return (
    <div className="military-home academy-about" id="top">
      <AcademyHeader about />
      <main id="main-content">
        <section className="aa-banner" aria-labelledby="about-title">
          <img
            src="/images/ota-gwalior-parade.jpg"
            alt="Trainees on parade at NCC Officers’ Training Academy, Gwalior"
            fetchPriority="high"
          />
          <div className="mh-container aa-banner-content">
            <span className="aa-eyebrow">CHARACTER • LEADERSHIP • SERVICE</span>
            <h1 id="about-title">
              ABOUT <span>THE ACADEMY</span>
            </h1>
            <nav aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={15} />
              <span>About us</span>
            </nav>
          </div>
          <a
            className="aa-banner-credit"
            href="https://x.com/OTAGwalior/status/1390948305928998912"
            target="_blank"
            rel="noreferrer"
          >
            PHOTO: NCC OTA GWALIOR <ArrowUpRight size={12} />
          </a>
        </section>
        <section className="mh-container aa-intro aa-section">
          <div className="aa-intro-visual">
            <img
              src="/images/ota-gwalior-march.jpg"
              alt="Women officers marching together at OTA Gwalior"
              loading="lazy"
            />
            <div className="aa-legacy">
              <strong>
                60<span>+</span>
              </strong>
              <span>
                YEARS OF
                <br />
                SHAPING LEADERS
              </span>
            </div>
            <span className="aa-image-caption">
              NCC OFFICERS’ TRAINING ACADEMY · GWALIOR
            </span>
          </div>
          <div className="aa-intro-copy">
            <span className="aa-eyebrow">OUR IDENTITY</span>
            <h2>
              A PROUD LEGACY.
              <br />A PURPOSE <span>THAT ENDURES.</span>
            </h2>
            <p className="aa-lead">
              Developing the officers who inspire the next generation.
            </p>
            <p>
              Located in Gwalior, Madhya Pradesh, the NCC Officers’ Training
              Academy prepares women officers and instructors for their
              responsibilities within the National Cadet Corps. Its training
              brings together professional learning, discipline and leadership.
            </p>
            <p>
              Known earlier as the Women Officers’ Training School, the
              institution became the Officers’ Training Academy in November
              2002. In 2025, the academy celebrated its Diamond Jubilee — six
              decades of service to NCC training.
            </p>
            <div className="aa-intro-points">
              <span>
                <ShieldCheck /> Unity & discipline
              </span>
              <span>
                <Users /> Women in leadership
              </span>
            </div>
            <a className="aa-text-link" href="#purpose">
              EXPLORE OUR PURPOSE <ArrowRight size={17} />
            </a>
          </div>
        </section>
        <div className="aa-motto">
          <div className="mh-container">
            <span>एकता और अनुशासन</span>
            <strong>
              UNITY <i /> DISCIPLINE <i /> SERVICE
            </strong>
            <Flag aria-hidden="true" />
          </div>
        </div>
        <section className="mh-container aa-section" id="purpose">
          <div className="aa-section-heading">
            <div>
              <span className="aa-eyebrow">WHAT GUIDES US</span>
              <h2>
                LEARN TO LEAD.
                <br />
                <span>LEAD TO SERVE.</span>
              </h2>
            </div>
            <p>
              Training is a shared commitment: to personal standards, to the
              team, and to the young people an officer will go on to guide.
            </p>
          </div>
          <div className="aa-values">
            {[
              {
                icon: ShieldCheck,
                number: '01',
                title: 'CHARACTER & DISCIPLINE',
                text: 'Practise integrity, responsibility and the consistency to lead by example — on the parade ground and beyond.',
              },
              {
                icon: Users,
                number: '02',
                title: 'CONFIDENT LEADERSHIP',
                text: 'Build the confidence to guide cadets, work as a team, and bring purpose to every training responsibility.',
              },
              {
                icon: BookOpen,
                number: '03',
                title: 'CONTINUOUS LEARNING',
                text: 'Strengthen knowledge and instructional skills through pre-commission training, refresher courses and development.',
              },
            ].map(({ icon: Icon, number, title, text }) => (
              <article key={number}>
                <div>
                  <Icon size={32} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="aa-heritage">
          <div className="mh-container aa-section">
            <span className="aa-eyebrow">MILESTONES THAT SHAPED US</span>
            <h2>
              A TRADITION <span>MOVING FORWARD.</span>
            </h2>
            <div className="aa-timeline">
              <article>
                <strong>2002</strong>
                <h3>A NEW CHAPTER</h3>
                <p>Renamed the NCC Officers’ Training Academy in November.</p>
              </article>
              <article>
                <strong>2004</strong>
                <h3>DEVELOPING POTENTIAL</h3>
                <p>
                  Personality development courses introduced for eligible girl
                  cadets preparing for the SSB.
                </p>
              </article>
              <article>
                <strong>2025</strong>
                <h3>DIAMOND JUBILEE</h3>
                <p>The academy marks six decades of training and service.</p>
              </article>
            </div>
          </div>
        </section>
        <section
          className="mh-container aa-section aa-parade"
          id="august-2026-parade"
          aria-labelledby="august-parade-title"
        >
          <div className="aa-section-heading">
            <div>
              <span className="aa-eyebrow">
                ACADEMY HIGHLIGHTS · 19 AUGUST 2026
              </span>
              <h2 id="august-parade-title">
                A PROUD PARADE.
                <br />
                <span>A NEW BEGINNING.</span>
              </h2>
            </div>
            <p>
              The PRCN JW-117 passing-out parade marked the completion of
              training for 129 ANOs and GCIs at NCC OTA Gwalior. Lt Gen Anindya
              Sengupta, GOC-in-C, Central Command, reviewed the ceremony.
            </p>
          </div>
          <div className="aa-parade-photos">
            <figure>
              <a
                href="/images/ota-august-2026-parade.webp"
                target="_blank"
                rel="noreferrer"
                aria-label="View full photo of the August 2026 passing-out parade"
              >
                <img
                  src="/images/ota-august-2026-parade.webp"
                  alt="NCC trainees marching in formation at the August 2026 OTA Gwalior passing-out parade"
                  loading="lazy"
                  width={1081}
                  height={719}
                />
                <span>
                  VIEW PHOTO <ArrowUpRight size={15} />
                </span>
              </a>
              <figcaption>
                <strong>PRIDE ON THE PARADE GROUND</strong>
                <span>Passing-out parade · PRCN JW-117 · August 2026</span>
              </figcaption>
            </figure>
            <figure>
              <a
                href="/images/ota-august-2026-pipping.webp"
                target="_blank"
                rel="noreferrer"
                aria-label="View full photo of the August 2026 pipping ceremony"
              >
                <img
                  src="/images/ota-august-2026-pipping.webp"
                  alt="Senior officers placing rank insignia on a trainee’s shoulders during the August 2026 pipping ceremony at OTA Gwalior"
                  loading="lazy"
                  width={1200}
                  height={798}
                />
                <span>
                  VIEW PHOTO <ArrowUpRight size={15} />
                </span>
              </a>
              <figcaption>
                <strong>A MILESTONE EARNED</strong>
                <span>Pipping ceremony · OTA Gwalior · August 2026</span>
              </figcaption>
            </figure>
          </div>
          <div className="aa-parade-source">
            <span>Photographs published by SSBCrack · 19 August 2026</span>
            <a
              className="aa-text-link"
              href="https://www.ssbcrack.com/2026/08/ncc-ota-gwalior-passing-out-parade-129-anos-and-gcis-commissioned.html"
              target="_blank"
              rel="noreferrer"
            >
              READ THE EVENT COVERAGE <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section
          className="mh-container aa-section aa-parade-film"
          id="parade-video"
          aria-labelledby="parade-film-title"
        >
          <div className="aa-section-heading">
            <div>
              <span className="aa-eyebrow">WATCH THE CEREMONY</span>
              <h2 id="parade-film-title">
                THE PARADE.
                <br />
                <span>THE PRIDE. THE MOMENT.</span>
              </h2>
            </div>
            <p>
              Watch the OTA Gwalior passing-out parade recording for 19 August,
              featuring PRCN Army JW-117, DC JW-88, Navy JW-14 and GCI-39.
            </p>
          </div>
          <div className="aa-video-frame">
            <iframe
              src="https://www.youtube-nocookie.com/embed/H_hTp8C_gnI"
              title="NCC OTA Gwalior passing-out parade — 19 August, PRCN Army JW-117 and associated courses"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="aa-parade-source">
            <span>Passing-out parade · NCC OTA Gwalior</span>
            <a
              className="aa-text-link"
              href="https://www.youtube.com/watch?v=H_hTp8C_gnI"
              target="_blank"
              rel="noreferrer"
            >
              WATCH ON YOUTUBE <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section
          className="mh-container aa-section aa-course-story"
          aria-labelledby="course-story-title"
        >
          <div className="aa-section-heading">
            <div>
              <span className="aa-eyebrow">FROM OTA TIMES · JW-117</span>
              <h2 id="course-story-title">
                BEHIND EVERY PARADE,
                <br />
                <span>A JOURNEY OF TRAINING.</span>
              </h2>
            </div>
            <p>
              A glimpse into academy life through photographs from the Hindi OTA
              Times JW-117 issue: practising together, learning in the field and
              sharing knowledge in the classroom.
            </p>
          </div>
          <div className="aa-training-photos">
            <figure>
              <img
                src="/images/ota-jw117-drill.jpg"
                alt="Trainees standing in formation during outdoor drill instruction at OTA Gwalior"
                width={679}
                height={512}
                loading="lazy"
              />
              <figcaption>
                <strong>DRILL & DISCIPLINE</strong>
                <span>Learning together, one session at a time.</span>
              </figcaption>
            </figure>
            <figure>
              <img
                src="/images/ota-jw117-field.jpg"
                alt="OTA trainees using field observation instruments during an outdoor training session"
                width={609}
                height={405}
                loading="lazy"
              />
              <figcaption>
                <strong>LEARNING IN THE FIELD</strong>
                <span>Putting observation and practical skills to work.</span>
              </figcaption>
            </figure>
            <figure>
              <img
                src="/images/ota-jw117-classroom.jpg"
                alt="An NCC trainee presenting to fellow trainees during a classroom session"
                width={660}
                height={449}
                loading="lazy"
              />
              <figcaption>
                <strong>KNOWLEDGE TO LEAD</strong>
                <span>Building confidence through classroom learning.</span>
              </figcaption>
            </figure>
          </div>
          <p className="aa-source-note">
            Photo source: OTA Times JW-117, Hindi issue, pages 2–3.
          </p>
        </section>
        <section className="mh-container aa-section" id="leadership">
          <div className="aa-section-heading">
            <div>
              <span className="aa-eyebrow">PEOPLE & PURPOSE</span>
              <h2>
                LEADERSHIP.
                <br />
                <span>INSPIRATION. SERVICE.</span>
              </h2>
            </div>
            <p>
              Meet the academy’s Commandant, the national leadership of the NCC,
              and a senior officer associated with a landmark academy occasion.
            </p>
          </div>
          <article className="aa-commandant" aria-labelledby="commandant-name">
            <figure className="aa-commandant-photo">
              <a
                href="/images/brig-sanjay-kumar-yadav-portrait.jpg"
                target="_blank"
                rel="noreferrer"
                aria-label="View portrait of Brigadier Sanjay Kumar Yadav"
              >
                <img
                  src="/images/brig-sanjay-kumar-yadav-portrait.jpg"
                  alt="Portrait of Brigadier Sanjay Kumar Yadav, Commandant of NCC OTA Gwalior"
                  width={260}
                  height={392}
                  loading="lazy"
                />
              </a>
              <figcaption>
                <strong>ACADEMY COMMANDANT</strong>
                <span>Photo: OTA Times JW-117, Hindi issue · page 1.</span>
              </figcaption>
            </figure>
            <div className="aa-commandant-copy">
              <span className="aa-eyebrow">COMMANDANT · NCC OTA GWALIOR</span>
              <h3 id="commandant-name">
                BRIGADIER
                <br />
                <span>SANJAY KUMAR YADAV</span>
              </h3>
              <p className="aa-lead">
                Leading the academy. Preparing tomorrow’s mentors.
              </p>
              <p>
                Brigadier Sanjay Kumar Yadav serves as Commandant of NCC
                Officers’ Training Academy, Gwalior. As the academy’s head, his
                role centres on the training and development of NCC officers and
                instructors.
              </p>
              <p>
                He attended the PRCN JW-117 passing-out parade on 19 August
                2026, which marked the completion of training for 129 ANOs and
                GCIs.
              </p>
              <a
                className="aa-text-link"
                href="https://www.uniindia.com/national/administration-gwalior-ncc/152929"
                target="_blank"
                rel="noreferrer"
              >
                COMMANDANT · AUGUST 2026 REPORT <ArrowUpRight size={16} />
              </a>
            </div>
          </article>
          <div className="aa-leaders">
            <article className="aa-leader">
              <div className="aa-leader-photo">
                <img
                  src="/images/dg-ncc-virendra-vats.jpg"
                  alt="Lt Gen Virendra Vats, Director General of the National Cadet Corps"
                  loading="lazy"
                />
                <span>NATIONAL LEADERSHIP</span>
              </div>
              <div className="aa-leader-copy">
                <span className="aa-eyebrow">DIRECTOR GENERAL · NCC</span>
                <h3>LT GEN VIRENDRA VATS</h3>
                <p>
                  Assumed charge as Director General on 1 October 2025. A
                  Ministry of Defence release dated 13 October 2026 identifies
                  him as the serving DG NCC.
                </p>
                <a
                  className="aa-text-link"
                  href={sources.dg}
                  target="_blank"
                  rel="noreferrer"
                >
                  OFFICIAL PROFILE SOURCE <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
            <article className="aa-leader">
              <div className="aa-leader-photo aa-ceremony">
                <img
                  src="/images/ota-gwalior-jubilee.jpg"
                  alt="Lt Gen Dhiraj Seth presenting a banner during the academy’s 2025 Diamond Jubilee ceremony"
                  loading="lazy"
                />
                <span>DIAMOND JUBILEE · 2025</span>
              </div>
              <div className="aa-leader-copy">
                <span className="aa-eyebrow">
                  REVIEWING OFFICER · 19 SEPTEMBER 2025
                </span>
                <h3>LT GEN DHIRAJ SETH</h3>
                <p>
                  As Southern Army Commander, he reviewed the academy’s Diamond
                  Jubilee passing-out parade, where 131 Lady Associate NCC
                  Officers were commissioned.
                </p>
                <a
                  className="aa-text-link"
                  href={sources.jubilee}
                  target="_blank"
                  rel="noreferrer"
                >
                  READ THE ACADEMY MILESTONE <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
          </div>
          <p className="aa-source-note">
            Leadership details reviewed 21 October 2026. Commandant appointment
            identified in UNI’s 19 August 2026 report. Lt Gen Dhiraj Seth’s
            profile records an academy event in 2025. Portrait and ceremony
            photography: Press Information Bureau.
          </p>
        </section>
        <section className="mh-container aa-access">
          <div className="aa-access-icon">
            <Award size={44} />
          </div>
          <div>
            <span className="aa-eyebrow">YOUR CONNECTED ACADEMY</span>
            <h2>
              YOUR JOURNEY.
              <br />
              <span>YOUR ACHIEVEMENTS.</span>
            </h2>
            <p>
              Explore affiliation programs, follow your assigned training and
              access your institutional completion certificates through your
              account.
            </p>
          </div>
          <Link to={certificates} className="mh-action">
            VIEW MY CERTIFICATES <ArrowUpRight size={18} />
          </Link>
        </section>
        <div className="mh-container aa-sources">
          ACADEMY REFERENCES{' '}
          <a href={sources.academy} target="_blank" rel="noreferrer">
            Academy history & courses <ArrowUpRight size={12} />
          </a>
          <a href={sources.jubilee} target="_blank" rel="noreferrer">
            Diamond Jubilee · PIB <ArrowUpRight size={12} />
          </a>
          <a href={sources.appointment} target="_blank" rel="noreferrer">
            DG appointment & portrait · PIB <ArrowUpRight size={12} />
          </a>
        </div>
      </main>
      <AcademyFooter />
    </div>
  );
}
