import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api, useLoad } from './api.js';
import { NOTES } from './demoData.js';
import { Button, Empty, Icon, IconButton, Logo, Sheet, ToastProvider } from './ui.jsx';
import { ALL_SERVICES, Activity, DemoSheet, Home, Inbox, Profile, Send, Services } from './pages/Wallet.jsx';
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
      return t === 'light' || t === 'dark' ? t : 'system';
    } catch {
      return 'system';
    }
  });
  const setTheme = useCallback((next) => {
    setThemeState(next);
    if (next === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    try {
      if (next === 'system') localStorage.removeItem('cashg-theme');
      else localStorage.setItem('cashg-theme', next);
    } catch {
      // The choice still applies for this visit.
    }
  }, []);
  return [theme, setTheme];
}

export function Page({ title, subtitle, back, notes, narrow, actions, hero, lifted, children }) {
  const { setNotesKey, notesOn, setNotesOn } = useApp();
  const navigate = useNavigate();
  const heading = useRef(null);
  useEffect(() => {
    setNotesKey(notes);
    document.title = `${title} · CashG`;
    // Move focus to the new screen's title so keyboard and screen-reader users land in the right place.
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [notes, title, setNotesKey]);
  const n = narrow ? ' narrow' : '';
  const notesButton = (
    <IconButton
      icon="Lightbulb"
      label={notesOn ? 'Hide design notes' : 'Show design notes'}
      aria-pressed={notesOn}
      onClick={() => setNotesOn(!notesOn)}
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}

function NotesPanel() {
  const { notesKey, setNotesOn } = useApp();
  const notes = NOTES[notesKey] || [];
  return (
    <aside className="notes" aria-label="Design notes">
      <div className="flex items-center justify-between gap-3">
        <h2>Design notes</h2>
        <IconButton icon="X" label="Hide design notes" onClick={() => setNotesOn(false)} />
      </div>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>What this screen does, and the principle behind it.</p>
      {notes.length ? (
        <ol>
          {notes.map(([principle, text]) => (
            <li key={principle}>
              <strong>{principle}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>No notes for this screen.</p>
      )}
    </aside>
  );
}

function Shell({ brand, kind = '', nav, tabs = nav, centre, footer }) {
  const { notesOn } = useApp();
  const links = (cls, items = nav) =>
    items.map((n) => (
      <NavLink key={n.to} to={n.to} end={n.end} className={cls}>
        <Icon name={n.icon} size={cls === 'nav-item' ? 18 : 22} />
        {n.label}
        {n.badge > 0 && <span className="badge" aria-label={`${n.badge} with new updates`}>{n.badge}</span>}
      </NavLink>
    ));
  return (
    <div className={`app ${kind}${notesOn ? ' with-notes' : ''}`}>
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
      <nav className="bottomnav" aria-label="Main">
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
  const [qr, setQr] = useState(false);
  // On phones the bar mirrors GCash (two tabs, raised QR, two tabs); Inbox moves to the bell on Home.
  const tabs = nav.filter((n) => n.to !== '/inbox');
  return (
    <>
    <DemoSheet service={qr ? ALL_SERVICES.find((s) => s.id === 'qr') : null} onClose={() => setQr(false)} />
    <Shell
      brand="CashG"
      kind="customer"
      nav={nav}
      tabs={tabs}
      centre={{ label: 'QR', icon: 'QrCode', onClick: () => setQr(true) }}
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
  const [notesOn, setNotesOn] = usePref('cashg-notes', false);
  const [hideBalance, setHideBalance] = usePref('cashg-hide-balance', false);
  const [notesKey, setNotesKey] = useState(null);
  const tickets = useLoad(api.tickets);
  const meta = useLoad(api.meta);

  const value = useMemo(
    () => ({
      theme, setTheme, notesOn, setNotesOn, hideBalance, setHideBalance, notesKey, setNotesKey, tickets,
      meta: meta.data || { categories: {}, transitions: {}, noteRequired: [] },
    }),
    [theme, setTheme, notesOn, setNotesOn, hideBalance, setHideBalance, notesKey, tickets, meta.data]
  );

  return (
    <AppContext.Provider value={value}>
      <ToastProvider>
        <Routes>
          <Route element={<CustomerShell />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
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
