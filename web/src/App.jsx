import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api, useLoad } from './api.js';
import { NOTES } from './demoData.js';
import { Button, Empty, Icon, IconButton, Logo, Sheet, SlidingFill, ToastProvider } from './ui.jsx';
import { Activity, Home, Inbox, Profile, Send, Services } from './pages/Wallet.jsx';
import { ServicePage } from './pages/ServicePages.jsx';
import { Help, NewTicket, TicketDetail, Tickets } from './pages/Tickets.jsx';
import { SupportConsole, SupportTicket } from './pages/Support.jsx';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Preferences live in this browser only. Storage can be blocked, so every access is guarded.
function usePref(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  });
  const set = useCallback((next) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // The choice still applies for this visit.
    }
  }, [key]);
  return [value, set];
}

function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      const t = localStorage.getItem('cashg-theme');
      return t === 'light' || t === 'system' ? t : 'dark'; // dark until a choice is saved
    } catch {
      return 'dark';
    }
  });
  const setTheme = useCallback((next) => {
    setThemeState(next);
    if (next === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.content = next === 'system' ? meta.dataset.default : next === 'dark' ? '#2f6fe4' : '#0866f2';
    }
    try {
      // 'system' is saved too, so following the device survives a reload instead of falling back to dark.
      localStorage.setItem('cashg-theme', next);
    } catch {
      // The choice still applies for this visit.
    }
  }, []);
  return [theme, setTheme];
}

export function Page({ title, subtitle, back, notes, narrow, actions, hero, lifted, rail, children }) {
  const { setNotesKey, notesOn, setNotesOn, notesSeen, notesMin, setNotesMin } = useApp();
  const navigate = useNavigate();
  const heading = useRef(null);
  useEffect(() => {
    setNotesKey(notes);
    document.title = `${title} | CashG`;
    // Move focus to the new screen's title so keyboard and screen-reader users land in the right place.
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [notes, title, setNotesKey]);
  const n = narrow ? ' narrow' : '';
  const notesButton = (
    <IconButton
      icon="Lightbulb"
      label={notesOn && !notesMin ? 'Hide design notes' : 'Show design notes'}
      aria-pressed={notesOn}
      data-cue={notesSeen ? undefined : ''}
      onClick={() => (notesOn && notesMin ? setNotesMin(false) : setNotesOn(!notesOn))}
    />
  );
  const headingProps = { ref: heading, tabIndex: -1, style: { outline: 'none' } };
  return (
    <>
      {hero ? hero({ heading: headingProps, notesButton }) : (
        <header className={`pagehead${n}`}>
          {back && <IconButton icon="ArrowLeft" label="Back" onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))} />}
          <h1 {...headingProps}>{title}</h1>
          {actions}
          {notesButton}
        </header>
      )}
      {subtitle && <p className={`pagehead-sub${n}`}>{subtitle}</p>}
      <motion.div
        className={`canvas${n}${lifted ? ' lifted' : ''}`}
        // A full transform string runs on the compositor; the y shorthand runs on the main thread, which is busy during a page change.
        initial={{ opacity: 0, transform: 'translateY(4px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* The rail comes first so it sits above the main column on narrow screens and floats beside it on wide ones. */}
        {rail}
        {children}
      </motion.div>
    </>
  );
}

function NotesPanel() {
  const { notesKey, setNotesOn, notesMin, setNotesMin } = useApp();
  const notes = NOTES[notesKey] || [];
  const [open, setOpen] = useState(null);
  useEffect(() => setOpen(null), [notesKey]);
  // An open note lights up the part of the screen it explains, so "what is this?" lands on "oh, that".
  useEffect(() => {
    const spot = notes[open]?.spot;
    if (!spot) return;
    const parts = [...document.querySelectorAll(`[data-note="${spot}"]`)].filter((el) => el.getClientRects().length);
    parts.forEach((el) => el.classList.add('note-spot'));
    parts[0]?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    return () => parts.forEach((el) => el.classList.remove('note-spot'));
  }, [open, notes]);
  return (
    <>
    {/* Minimised, the panel only hides: the open question and its spotlight stay, so the screen can be read beside it. */}
    <aside className="notes" aria-label="Design notes" hidden={notesMin}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex-1">Behind this screen</h2>
        <IconButton icon="Minimize2" label="Minimise design notes" onClick={() => setNotesMin(true)} />
        <IconButton icon="X" label="Hide design notes" onClick={() => setNotesOn(false)} />
      </div>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Tap a question to see the thinking behind it.</p>
      {notes.length ? (
        <ol>
          {notes.map((n, i) => (
            <li key={n.q} className={open === i ? 'open' : ''}>
              <button type="button" className="note-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                <span>{n.q}</span>
                {n.spot && <Icon name="Crosshair" size={14} style={{ color: 'var(--accent-text)', flex: 'none' }} />}
                <Icon name="ChevronDown" size={18} />
              </button>
              {open === i && (
                <div className="note-a">
                  <p>{n.a}</p>
                  <span className="note-law">{n.law}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>No notes for this screen.</p>
      )}
    </aside>
    {notesMin && (
      <button type="button" className="notes-fab" aria-label="Open design notes again" title="Design notes" onClick={() => setNotesMin(false)}>
        <Icon name="CircleHelp" size={22} />
      </button>
    )}
    </>
  );
}

function Shell({ brand, kind = '', nav, tabs = nav, centre, footer }) {
  const { notesOn, notesMin } = useApp();
  const links = (cls, items = nav) =>
    items.map((n) => (
      <NavLink key={n.to} to={n.to} end={n.end} className={cls}>
        {({ isActive }) => (
          <>
            {isActive && (cls === 'nav-item' ? <SlidingFill id="nav" className="nav-bg" radius={10} /> : <SlidingFill id="tab" className="tab-bg" />)}
            <Icon name={n.icon} size={cls === 'nav-item' ? 18 : 22} />
            {n.label}
            {n.badge > 0 && <span className="badge" aria-label={`${n.badge} with new updates`}>{n.badge}</span>}
          </>
        )}
      </NavLink>
    ));
  return (
    <div className={`app ${kind}${notesOn && !notesMin ? ' with-notes' : ''}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 btn primary">Skip to content</a>
      <aside className="sidebar">
        <Link to={nav[0].to} className="brand" style={{ padding: '0 12px 20px' }}>
          <Logo />
          {brand}
        </Link>
        <nav aria-label="Main">{links('nav-item')}</nav>
        <div style={{ marginTop: 'auto' }}>{footer}</div>
      </aside>
      <main id="main" className="main">
        <Outlet />
      </main>
      {notesOn && <NotesPanel />}
      <nav className="bottomnav" aria-label="Main" data-note="bar">
        {centre ? (
          <>
            {links('', tabs.slice(0, 2))}
            <button type="button" className="qr" onClick={centre.onClick}>
              <span className="qr-disc"><Icon name={centre.icon} size={26} /></span>
              {centre.label}
            </button>
            {links('', tabs.slice(2))}
          </>
        ) : links('', tabs)}
      </nav>
    </div>
  );
}

const Disclaimer = () => (
  <p className="px-3 pt-3 text-xs" style={{ color: 'var(--muted)' }}>
    Academic demo. Not affiliated with GCash. No real money moves here.
  </p>
);

function CustomerShell() {
  const { tickets } = useApp();
  const unread = (tickets.data || []).filter((t) => t.unread).length;
  const nav = [
    { to: '/', label: 'Home', icon: 'Home', end: true },
    { to: '/activity', label: 'Activity', icon: 'List' },
    { to: '/help', label: 'Help', icon: 'LifeBuoy', badge: unread },
    { to: '/inbox', label: 'Inbox', icon: 'Bell' },
    { to: '/profile', label: 'Profile', icon: 'User' },
  ];
  const navigate = useNavigate();
  // On phones the bar mirrors GCash (two tabs, raised QR, two tabs); Inbox moves to the bell on Home.
  const tabs = nav.filter((n) => n.to !== '/inbox');
  return (
    <>
    <Shell
      brand="CashG"
      kind="customer"
      nav={nav}
      tabs={tabs}
      centre={{ label: 'QR', icon: 'QrCode', onClick: () => navigate('/services/qr') }}
      footer={
        <>
          <Link to="/services" className="nav-item"><Icon name="LayoutGrid" size={18} />All services</Link>
          <Link to="/support" className="nav-item"><Icon name="Headphones" size={18} />Support console</Link>
          <Disclaimer />
        </>
      }
    />
    </>
  );
}

function SupportShell() {
  const nav = [
    { to: '/support', label: 'Queue', icon: 'Inbox' },
    { to: '/', label: 'Customer app', icon: 'Smartphone', end: true },
  ];
  return <Shell brand="CashG Support" nav={nav} footer={<Disclaimer />} />;
}

function NotFound() {
  return (
    <Page title="Page not found" narrow>
      <div className="card">
        <Empty icon="Compass" title="This screen does not exist" action={<Link className="btn primary" to="/">Go to Home</Link>}>
          The link may be old, or the address was typed incorrectly.
        </Empty>
      </div>
    </Page>
  );
}

// Session recording is only switched on after the tester has been told about it.
function RecordingNotice({ projectId }) {
  const valid = /^[a-z0-9]{6,20}$/i.test(projectId || '');
  const [agreed, setAgreed] = usePref('cashg-recording-ok', false);
  useEffect(() => {
    if (!valid || !agreed || window.clarity) return;
    window.clarity = function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${projectId}`;
    document.head.appendChild(script);
  }, [valid, agreed, projectId]);
  if (!valid) return null;
  return (
    <Sheet open={!agreed} onClose={() => setAgreed(true)} title="Before you start">
      <p>
        This copy of CashG is part of a university usability study. While you use it, your taps, scrolling and the screens you visit
        are recorded with Microsoft Clarity so the design team can see where the design works and where it does not.
      </p>
      <p style={{ color: 'var(--muted)' }}>Everything in the app is sample data. Please do not type real personal or financial details.</p>
      <Button block onClick={() => setAgreed(true)}>I understand, continue</Button>
    </Sheet>
  );
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [notesOn, setNotesPref] = usePref('cashg-notes', false);
  // The lightbulb carries a small dot until the notes have been opened once, then never again.
  const [notesSeen, setNotesSeen] = usePref('cashg-notes-seen', false);
  const [notesMin, setNotesMin] = useState(false);
  const setNotesOn = useCallback((on) => { setNotesPref(on); setNotesMin(false); if (on) setNotesSeen(true); }, [setNotesPref, setNotesSeen]);
  const [hideBalance, setHideBalance] = usePref('cashg-hide-balance', false);
  const [notesKey, setNotesKey] = useState(null);
  const tickets = useLoad(api.tickets);
  const meta = useLoad(api.meta);

  const value = useMemo(
    () => ({
      theme, setTheme, notesOn, setNotesOn, notesSeen, notesMin, setNotesMin, hideBalance, setHideBalance, notesKey, setNotesKey, tickets,
      meta: meta.data || { categories: {}, transitions: {}, noteRequired: [] },
    }),
    [theme, setTheme, notesOn, setNotesOn, notesSeen, notesMin, hideBalance, setHideBalance, notesKey, tickets, meta.data]
  );

  return (
    <AppContext.Provider value={value}>
      <ToastProvider>
        <Routes>
          <Route element={<CustomerShell />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:id" element={<ServicePage />} />
            <Route path="send" element={<Send />} />
            <Route path="activity" element={<Activity />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="profile" element={<Profile />} />
            <Route path="help" element={<Help />} />
            <Route path="help/new" element={<NewTicket />} />
            <Route path="help/tickets" element={<Tickets />} />
            <Route path="help/tickets/:reference" element={<TicketDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="support" element={<SupportShell />}>
            <Route index element={<SupportConsole />} />
            <Route path=":reference" element={<SupportTicket />} />
          </Route>
        </Routes>
        <RecordingNotice projectId={meta.data?.clarityProjectId} />
      </ToastProvider>
    </AppContext.Provider>
  );
}
