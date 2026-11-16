import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Page, useApp } from '../App.jsx';
import { BALANCE, CONTACTS, LIMITS, NOTICES, QUICK_ACTIONS, SERVICE_GROUPS, TRANSACTIONS, USER } from '../demoData.js';
import { MAIN_STAGES, OPEN_STATUSES, STATUS, dayLabel, formatDateTime, formatTime, money, signedMoney } from '../lib.js';
import { Button, Chips, Empty, Field, Icon, IconButton, LoadError, Segmented, Sheet, SkeletonRows, StatusPill, Switch, useToast } from '../ui.jsx';

export const ALL_SERVICES = SERVICE_GROUPS.flatMap((g) => g.items);
const DEMO_LINE = 'This screen is a design demonstration. No money moves and nothing is saved.';

export function DemoSheet({ service, onClose }) {
  return (
    <Sheet open={!!service} onClose={onClose} title={service?.label || ''}>
      <p>{service?.about}</p>
      <div className="notice info">
        <Icon name="Info" style={{ flex: 'none', marginTop: 2 }} />
        <p>{DEMO_LINE}</p>
      </div>
      <Button block onClick={onClose}>Got it</Button>
    </Sheet>
  );
}

function useService() {
  const navigate = useNavigate();
  const [demo, setDemo] = useState(null);
  const open = (service) => (service.to ? navigate(service.to) : setDemo(service));
  return [open, <DemoSheet key="demo" service={demo} onClose={() => setDemo(null)} />];
}

function TransactionRow({ t, onOpen }) {
  return (
    <button type="button" className="row" onClick={() => onOpen(t)}>
      <span className="avatar"><Icon name={t.amount > 0 ? 'ArrowDownLeft' : 'ArrowUpRight'} size={18} /></span>
      <span className="row-main">
        <span className="row-title block">{t.title}</span>
        <span className="row-sub block">{t.kind} · {formatTime(t.at)}</span>
      </span>
      <span className="row-end num" style={{ fontWeight: 600, color: t.amount > 0 ? 'var(--positive)' : 'var(--text)' }}>
        {signedMoney(t.amount)}
      </span>
    </button>
  );
}

const REPORT_CATEGORY = { 'Cash in': 'cash_in', 'Send money': 'send_money', 'Receive money': 'send_money' };

function ReceiptSheet({ t, onClose }) {
  return (
    <Sheet open={!!t} onClose={onClose} title="Transaction details">
      {t && (
        <>
          <div className="text-center">
            <p className="num text-3xl font-semibold" style={{ color: t.amount > 0 ? 'var(--positive)' : 'var(--text)' }}>{signedMoney(t.amount)}</p>
            <p style={{ color: 'var(--muted)' }}>{t.title}</p>
          </div>
          <dl className="kv">
            <dt>Type</dt><dd>{t.kind}</dd>
            <dt>{t.amount > 0 ? 'From' : 'To'}</dt><dd>{t.party}</dd>
            <dt>Date</dt><dd>{formatDateTime(t.at)}</dd>
            <dt>Status</dt><dd>Completed</dd>
          </dl>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Sample transaction for the demo.</p>
          <Link
            className="btn secondary wide"
            to={`/help/new?category=${REPORT_CATEGORY[t.kind] || 'bills'}`}
            // The ticket form opens already filled with what we know about this transaction.
            state={{ subject: `Problem with: ${t.title}`, details: `${t.kind}, ${money(Math.abs(t.amount))}, ${formatDateTime(t.at)}` }}
          >
            <Icon name="LifeBuoy" size={18} />Report a problem with this
          </Link>
        </>
      )}
    </Sheet>
  );
}

// The product's own signature element: a live ticket stage, surfaced on Home.
function TicketCard() {
  const { tickets } = useApp();
  if (tickets.loading && !tickets.data) return <section className="card"><div className="card-head"><h2>Your support ticket</h2></div><SkeletonRows rows={1} /></section>;
  if (tickets.error && !tickets.data) return <section className="card"><LoadError error={tickets.error} onRetry={tickets.reload} /></section>;
  const open = tickets.data.filter((t) => OPEN_STATUSES.includes(t.status));
  const ticket = open.find((t) => t.status === 'waiting_for_customer') || open[0];
  if (!ticket) {
    return (
      <section className="card card-pad grid gap-3">
        <h2 className="text-base">Need help with something?</h2>
        <p style={{ color: 'var(--muted)' }}>You have no open support tickets.</p>
        <Link className="btn secondary" to="/help"><Icon name="LifeBuoy" size={18} />Get help</Link>
      </section>
    );
  }
  const waiting = ticket.status === 'waiting_for_customer';
  // While a ticket waits on the customer its stage on the main road is not in the list, so the bar holds at "in progress".
  const reached = waiting ? MAIN_STAGES.indexOf('in_progress') : MAIN_STAGES.indexOf(ticket.status);
  return (
    <section className="card">
      <div className="card-head">
        <h2>Your support ticket</h2>
        {open.length > 1 && <Link className="link" to="/help/tickets">All {open.length} open</Link>}
      </div>
      <Link to={`/help/tickets/${ticket.reference}`} className="row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10, alignItems: 'start' }}>
        <span className="flex items-start justify-between gap-3">
          <span className="row-main">
            <span className="block font-medium">{ticket.subject}</span>
            <span className="row-sub num block">{ticket.reference}</span>
          </span>
          <StatusPill status={ticket.status} />
        </span>
        <span className="stepper" aria-hidden="true">
          {MAIN_STAGES.map((s, i) => <span key={s} className={i <= reached ? 'on' : ''} />)}
        </span>
        <span className="text-sm" style={{ color: waiting ? 'var(--pill-warning-ink)' : 'var(--muted)', fontWeight: waiting ? 600 : 400 }}>
          {waiting ? 'We need a reply from you to continue.' : STATUS[ticket.status].help}
        </span>
      </Link>
    </section>
  );
}

export function Home() {
  const { hideBalance, setHideBalance } = useApp();
  const [openService, demoSheet] = useService();
  const [receipt, setReceipt] = useState(null);
  const navigate = useNavigate();
  const quick = QUICK_ACTIONS.map((id) => ALL_SERVICES.find((s) => s.id === id));
  return (
    <Page
      title="Home"
      notes="home"
      lifted
      hero={({ heading, notesButton }) => (
        <header className="hero">
          <div className="hero-inner">
            <div className="flex items-center gap-2">
              <span className="avatar" aria-hidden="true">{USER.initials}</span>
              <h1 {...heading}>Hello, {USER.name.split(' ')[0]}</h1>
              <Link to="/inbox" className="icon-btn" aria-label="Inbox" title="Inbox"><Icon name="Bell" /></Link>
              {notesButton}
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="balance-label">Available balance</span>
                  <IconButton
                    icon={hideBalance ? 'EyeOff' : 'Eye'}
                    label={hideBalance ? 'Show balance' : 'Hide balance'}
                    aria-pressed={hideBalance}
                    onClick={() => setHideBalance(!hideBalance)}
                  />
                </div>
                <p className="balance-figure">{hideBalance ? '₱ ••••••' : money(BALANCE)}</p>
              </div>
              <button type="button" className="cashin" onClick={() => openService(ALL_SERVICES.find((s) => s.id === 'cashin'))}>
                <Icon name="Plus" size={18} />Cash in
              </button>
            </div>
          </div>
        </header>
      )}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <nav className="card services" aria-label="Services">
            {quick.map((s) => (
              <button key={s.id} type="button" className="svc" onClick={() => openService(s)}>
                <span className="svc-icon"><Icon name={s.icon} size={24} /></span>
                {s.label}
              </button>
            ))}
            <button type="button" className="svc" onClick={() => navigate('/services')}>
              <span className="svc-icon"><Icon name="LayoutGrid" size={24} /></span>
              View all
            </button>
          </nav>

          <div className="lg:hidden"><TicketCard /></div>

          <section className="card">
            <div className="card-head">
              <h2>Recent activity</h2>
              <Link className="link" to="/activity">View all</Link>
            </div>
            {TRANSACTIONS.slice(0, 4).map((t) => <TransactionRow key={t.id} t={t} onOpen={setReceipt} />)}
          </section>
        </div>

        <div className="hidden gap-6 lg:grid">
          <TicketCard />
          <section className="card card-pad grid gap-3">
            <h2 className="text-base">Stay safe</h2>
            <p style={{ color: 'var(--muted)' }}>CashG will never ask for your MPIN or a one-time code, by call, text or chat.</p>
            <Link className="link" to="/help">Go to Help</Link>
          </section>
        </div>
      </div>
      {demoSheet}
      <ReceiptSheet t={receipt} onClose={() => setReceipt(null)} />
    </Page>
  );
}

export function Services() {
  const [query, setQuery] = useState('');
  const [openService, demoSheet] = useService();
  const q = query.trim().toLowerCase();
  const groups = SERVICE_GROUPS.map((g) => ({ ...g, items: g.items.filter((s) => !q || `${s.label} ${s.about}`.toLowerCase().includes(q)) })).filter((g) => g.items.length);
  return (
    <Page title="All services" subtitle="Everything CashG can do, grouped by what you want to get done." notes="services" back="/">
      <div className="search mb-6 max-w-xl">
        <Icon name="Search" size={18} />
        <input className="input" type="search" placeholder="Search services" aria-label="Search services" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {groups.length === 0 ? (
        <div className="card"><Empty icon="SearchX" title={`Nothing matches “${query.trim()}”`}>Try a shorter word, like “bills” or “send”.</Empty></div>
      ) : (
        <div className="grid items-start gap-6 md:grid-cols-2">
          {groups.map((g) => (
            <section key={g.title} className="card">
              <div className="card-head"><h2>{g.title}</h2></div>
              {g.items.map((s) => (
                <button key={s.id} type="button" className="row" onClick={() => openService(s)}>
                  <Icon name={s.icon} style={{ color: 'var(--muted)', flex: 'none' }} />
                  <span className="row-main"><span className="row-title block">{s.label}</span><span className="row-sub block">{s.about}</span></span>
                  <Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)', flex: 'none' }} />
                </button>
              ))}
            </section>
          ))}
        </div>
      )}
      {demoSheet}
    </Page>
  );
}

// Accept the number however people type it: spaces, dashes, or the +63 form.
const cleanMobile = (v) => {
  const digits = v.replace(/\D/g, '');
  return digits.startsWith('63') && digits.length === 12 ? '0' + digits.slice(2) : digits;
};

export function Send() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [to, setTo] = useState({ name: '', mobile: '' });
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const value = Number(amount);

  const checkRecipient = () => {
    const digits = cleanMobile(to.mobile);
    if (!/^09\d{9}$/.test(digits)) return setErrors({ mobile: 'Enter an 11-digit mobile number that starts with 09.' });
    setErrors({});
    setTo((t) => ({ ...t, mobile: digits.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3') }));
    setStep(1);
  };
  const checkAmount = () => {
    if (!amount || Number.isNaN(value) || value <= 0) return setErrors({ amount: 'Enter an amount greater than zero.' });
    if (value > BALANCE) return setErrors({ amount: `That is more than your balance of ${money(BALANCE)}.` });
    setErrors({});
    setStep(2);
  };
  const send = () => {
    setBusy(true);
    // The pause only shows what the sending state looks like. Nothing is sent.
    setTimeout(() => {
      setBusy(false);
      setStep(3);
    }, 700);
  };

  const titles = ['Who are you sending to?', 'How much?', 'Check before you send', 'Demo complete'];
  return (
    <Page title="Send money" notes="send" narrow back={step === 0 || step === 3 ? '/' : undefined} actions={null}>
      {step < 3 && (
        <div className="mb-5 grid gap-2">
          <div className="stepper" role="img" aria-label={`Step ${step + 1} of 3`}>{[0, 1, 2].map((i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Step {step + 1} of 3</p>
          <h2 className="text-xl">{titles[step]}</h2>
        </div>
      )}

      {step === 0 && (
        <div className="grid gap-6">
          <section className="card card-pad grid gap-4">
            <Field label="Mobile number" error={errors.mobile} hint="Any format works: 0917 555 0142 or +63 917 555 0142">
              {(p) => <input {...p} className="input num" inputMode="numeric" autoComplete="off" value={to.mobile} onChange={(e) => setTo({ name: '', mobile: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && checkRecipient()} />}
            </Field>
            <Button block onClick={checkRecipient}>Continue</Button>
          </section>
          <section className="card">
            <div className="card-head"><h2>Recent</h2></div>
            {CONTACTS.map((c) => (
              <button key={c.mobile} type="button" className="row" onClick={() => { setTo(c); setErrors({}); setStep(1); }}>
                <span className="avatar">{c.initials}</span>
                <span className="row-main"><span className="row-title block">{c.name}</span><span className="row-sub num block">{c.mobile}</span></span>
                <Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)', flex: 'none' }} />
              </button>
            ))}
          </section>
        </div>
      )}

      {step === 1 && (
        <section className="card card-pad grid gap-4">
          <p style={{ color: 'var(--muted)' }}>To {to.name || 'this number'} · <span className="num">{to.mobile}</span></p>
          <Field label="Amount in pesos" error={errors.amount} hint={`Available: ${money(BALANCE)}`}>
            {(p) => <input {...p} className="input num text-2xl font-semibold" inputMode="decimal" placeholder="0.00" autoFocus value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && checkAmount()} />}
          </Field>
          <Chips label="Quick amounts" value={amount} onChange={setAmount} options={['100', '500', '1000'].map((v) => ({ value: v, label: money(Number(v)) }))} />
          <Field label="Message" optional>
            {(p) => <input {...p} className="input" maxLength={60} value={message} onChange={(e) => setMessage(e.target.value)} />}
          </Field>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
            <Button block onClick={checkAmount}>Review</Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card card-pad grid gap-5">
          <dl className="kv">
            <dt>To</dt><dd>{to.name || 'Mobile number'}</dd>
            <dt>Number</dt><dd className="num">{to.mobile}</dd>
            <dt>Amount</dt><dd className="num">{money(value)}</dd>
            <dt>Fee</dt><dd className="num">{money(0)}</dd>
            {message && (<><dt>Message</dt><dd>{message}</dd></>)}
            <dt>Balance after</dt><dd className="num">{money(BALANCE - value)}</dd>
          </dl>
          <div className="notice info"><Icon name="Info" style={{ flex: 'none', marginTop: 2 }} /><p>{DEMO_LINE}</p></div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} disabled={busy}>Back</Button>
            <Button block busy={busy} onClick={send}>{busy ? 'Sending' : `Send ${money(value)}`}</Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="card">
          <Empty icon="CircleCheck" title="This is where the receipt would be" action={<Button onClick={() => navigate('/')}>Back to Home</Button>}>
            In the real app, {money(value)} would now be on its way to {to.name || to.mobile}. This is a design demonstration, so no money was sent.
          </Empty>
        </section>
      )}
    </Page>
  );
}

export function Activity() {
  const [filter, setFilter] = useState('all');
  const [receipt, setReceipt] = useState(null);
  const groups = useMemo(() => {
    const rows = TRANSACTIONS.filter((t) => filter === 'all' || (filter === 'in' ? t.amount > 0 : t.amount < 0));
    const byDay = new Map();
    for (const t of rows) {
      const key = dayLabel(t.at);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(t);
    }
    return [...byDay];
  }, [filter]);
  return (
    <Page title="Activity" notes="activity" narrow>
      <div className="mb-5">
        <Chips label="Filter transactions" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'in', label: 'Money in' }, { value: 'out', label: 'Money out' }]} />
      </div>
      <div className="grid gap-6">
        {groups.map(([day, rows]) => (
          <section key={day}>
            <h2 className="section-title" style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 14 }}>{day}</h2>
            <div className="card">{rows.map((t) => <TransactionRow key={t.id} t={t} onOpen={setReceipt} />)}</div>
          </section>
        ))}
      </div>
      <p className="mt-6 text-sm" style={{ color: 'var(--muted)' }}>Sample transactions for the demo.</p>
      <ReceiptSheet t={receipt} onClose={() => setReceipt(null)} />
    </Page>
  );
}

export function Inbox() {
  const { tickets } = useApp();
  const [tab, setTab] = useState('updates');
  const updated = (tickets.data || []).filter((t) => t.unread);
  const notices = NOTICES.filter((n) => n.tab === tab);
  return (
    <Page title="Inbox" notes="inbox" narrow>
      <div className="mb-5">
        <Segmented label="Inbox section" value={tab} onChange={setTab} options={[{ value: 'updates', label: 'Updates' }, { value: 'offers', label: 'Offers' }]} />
      </div>
      <div className="grid gap-6">
        {tab === 'updates' && updated.length > 0 && (
          <section>
            <h2 className="section-title">Support ticket updates</h2>
            <div className="card">
              {updated.map((t) => (
                <Link key={t.reference} className="row" to={`/help/tickets/${t.reference}`}>
                  <span className="dot" aria-hidden="true" />
                  <span className="row-main"><span className="row-title block">{t.subject}</span><span className="row-sub block">Updated {formatDateTime(t.updatedAt)}</span></span>
                  <StatusPill status={t.status} />
                </Link>
              ))}
            </div>
          </section>
        )}
        <section>
          <h2 className="section-title">{tab === 'updates' ? 'Account updates' : 'Offers'}</h2>
          <div className="card">
            {notices.map((n) => (
              <div key={n.id} className="row" style={{ alignItems: 'flex-start' }}>
                <Icon name={tab === 'updates' ? 'Bell' : 'Tag'} style={{ color: 'var(--muted)', flex: 'none', marginTop: 2 }} />
                <span className="row-main">
                  <span className="block font-medium">{n.title}</span>
                  <span className="block text-sm" style={{ color: 'var(--muted)' }}>{n.body}</span>
                  <span className="block text-sm" style={{ color: 'var(--muted)' }}>{formatDateTime(n.at)}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}

export function Profile() {
  const { theme, setTheme, notesOn, setNotesOn, hideBalance, setHideBalance } = useApp();
  const toast = useToast();
  const [demo, setDemo] = useState(null);
  const used = Math.round((LIMITS.used / LIMITS.total) * 100);
  const security = [
    { label: 'Change MPIN', about: 'Update the 4-digit code that protects your wallet.', icon: 'KeyRound' },
    { label: 'Biometric login', about: 'Sign in with your fingerprint or face.', icon: 'Fingerprint' },
    { label: 'Trusted devices', about: 'See and remove devices that can open your wallet.', icon: 'Smartphone' },
  ];
  return (
    <Page title="Profile" notes="profile" narrow>
      <div className="grid gap-6">
        <section className="card card-pad flex items-center gap-4">
          <span className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{USER.initials}</span>
          <div className="row-main">
            <p className="text-lg font-semibold">{USER.name}</p>
            <p className="num" style={{ color: 'var(--muted)' }}>{USER.mobile}</p>
          </div>
          <span className="pill positive"><Icon name="ShieldCheck" size={14} />Verified</span>
        </section>

        <section>
          <h2 className="section-title">Appearance</h2>
          <div className="card">
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <span className="row-main" style={{ minWidth: 200 }}><span className="block font-medium">Theme</span><span className="block text-sm" style={{ color: 'var(--muted)' }}>Light, dark, or follow this device.</span></span>
              <Segmented
                label="Theme"
                value={theme}
                onChange={(t) => { setTheme(t); toast(t === 'system' ? 'Theme now follows this device' : `${t === 'dark' ? 'Dark' : 'Light'} theme on`); }}
                options={[{ value: 'light', label: 'Light', icon: 'Sun' }, { value: 'dark', label: 'Dark', icon: 'Moon' }, { value: 'system', label: 'Device', icon: 'Monitor' }]}
              />
            </div>
            <div className="row">
              <span className="row-main"><span className="block font-medium">Hide balance</span><span className="block text-sm" style={{ color: 'var(--muted)' }}>Cover your balance on Home.</span></span>
              <Switch checked={hideBalance} onChange={setHideBalance} label="Hide balance" />
            </div>
            <div className="row">
              <span className="row-main"><span className="block font-medium">Design notes</span><span className="block text-sm" style={{ color: 'var(--muted)' }}>Show the UX principle behind each screen.</span></span>
              <Switch checked={notesOn} onChange={setNotesOn} label="Design notes" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="section-title">{LIMITS.label}</h2>
          <div className="card card-pad grid gap-3">
            <div className="meter" role="img" aria-label={`${used}% of the monthly limit used`}><span style={{ width: `${used}%` }} /></div>
            <div className="flex justify-between text-sm"><span className="num">{money(LIMITS.used)} used</span><span className="num" style={{ color: 'var(--muted)' }}>of {money(LIMITS.total)}</span></div>
          </div>
        </section>

        <section>
          <h2 className="section-title">Security</h2>
          <div className="card">
            {security.map((s) => (
              <button key={s.label} type="button" className="row" onClick={() => setDemo(s)}>
                <Icon name={s.icon} style={{ color: 'var(--muted)', flex: 'none' }} />
                <span className="row-main"><span className="row-title block">{s.label}</span><span className="row-sub block">{s.about}</span></span>
                <Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)', flex: 'none' }} />
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">Support</h2>
          <div className="card">
            <Link className="row" to="/help/tickets"><Icon name="Ticket" style={{ color: 'var(--muted)', flex: 'none' }} /><span className="row-main row-title">My tickets</span><Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)' }} /></Link>
            <Link className="row" to="/support"><Icon name="Headphones" style={{ color: 'var(--muted)', flex: 'none' }} /><span className="row-main"><span className="row-title block">Support console</span><span className="row-sub block">The staff side, for testing the full ticket journey.</span></span><Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)' }} /></Link>
          </div>
        </section>

        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          CashG is an academic redesign concept made for a university UI/UX course. It is not affiliated with, endorsed by, or connected to GCash.
          All names, balances and transactions are sample data.
        </p>
      </div>
      <DemoSheet service={demo} onClose={() => setDemo(null)} />
    </Page>
  );
}
