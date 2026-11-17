import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Page, useApp } from '../App.jsx';
import { api, useLoad } from '../api.js';
import { CATEGORY_HELP, FAQS } from '../demoData.js';
import { StaySafe } from './Wallet.jsx';
import { MAIN_STAGES, OPEN_STATUSES, STATUS, buildTracker, formatDate, formatDateTime, matchesQuery } from '../lib.js';
import { Button, Chips, DrawnCheck, Empty, Field, Icon, IconButton, LoadError, SkeletonRows, StatusPill, statusIcon, useToast } from '../ui.jsx';

const CATEGORY_ICON = { cash_in: 'Plus', send_money: 'Send', bills: 'Receipt', account: 'UserCheck', unauthorized: 'ShieldAlert', other: 'CircleHelp' };
const RULES = { subject: [5, 100], description: [20, 2000], details: [0, 300] };

function validate(field, value) {
  const [min, max] = RULES[field];
  const len = value.trim().length;
  if (min > 0 && len === 0) return field === 'subject' ? 'Give your ticket a short subject.' : 'Tell us what happened.';
  if (len < min) return `Please write at least ${min} characters. You have ${len}.`;
  if (len > max) return `Please keep this under ${max} characters.`;
  return '';
}

// An unfinished ticket is kept on this device until it is sent, so leaving the form never loses work.
const DRAFT_KEY = 'cashg-ticket-draft';
export function readDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY));
    return draft && typeof draft.subject === 'string' && typeof draft.description === 'string' ? draft : null;
  } catch {
    return null;
  }
}
function writeDraft(form) {
  try {
    if (form && (form.subject.trim() || form.description.trim())) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage is unavailable: the form still works, it just is not kept.
  }
}

export function useCopy() {
  const toast = useToast();
  return async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Reference number copied', 'Copy');
    } catch {
      toast('Could not copy. Press and hold the number to copy it.', 'AlertCircle');
    }
  };
}

export function Help() {
  const { tickets, meta } = useApp();
  const list = tickets.data || [];
  const open = list.filter((t) => OPEN_STATUSES.includes(t.status)).length;
  const updated = list.filter((t) => t.unread).length;
  const draft = readDraft();
  return (
    <Page title="Help" subtitle="Find an answer, or send us a ticket and follow it step by step." notes="help">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="grid gap-6">
          <section className="card">
            <Link className="row" to="/help/tickets" style={{ minHeight: 76 }}>
              <span className="avatar" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}><Icon name="Ticket" size={18} /></span>
              <span className="row-main">
                <span className="row-title block">My tickets</span>
                <span className="row-sub block">
                  {tickets.loading && !tickets.data ? 'Loading' : `${open} open${updated ? `, ${updated} with new updates` : ''}`}
                </span>
              </span>
              {updated > 0 && <span className="badge" aria-hidden="true">{updated}</span>}
              <Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)' }} />
            </Link>
          </section>

          {draft && (
            <section className="card">
              <Link className="row" to="/help/new" style={{ minHeight: 76 }}>
                <span className="avatar" style={{ background: 'var(--pill-warning-bg)', color: 'var(--pill-warning-ink)' }}><Icon name="PencilLine" size={18} /></span>
                <span className="row-main">
                  <span className="row-title block">Finish your ticket</span>
                  <span className="row-sub block">{draft.subject.trim() || 'You started a ticket and have not sent it yet.'}</span>
                </span>
                <Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)' }} />
              </Link>
            </section>
          )}

          <section>
            <h2 className="section-title">What do you need help with?</h2>
            <div className="card grid sm:grid-cols-2" style={{ overflow: 'hidden' }}>
              {Object.entries(meta.categories).map(([key, label]) => (
                <Link key={key} className="row" to={`/help/new?category=${key}`} style={{ borderTop: '1px solid var(--rule)', borderRadius: 0, minHeight: 76 }}>
                  <Icon name={CATEGORY_ICON[key]} style={{ color: 'var(--accent-text)', flex: 'none' }} />
                  <span className="row-main">
                    <span className="row-title block">{label}</span>
                    <span className="block text-sm" style={{ color: 'var(--muted)' }}>{CATEGORY_HELP[key]?.example}</span>
                  </span>
                  <Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)', flex: 'none' }} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section>
          <h2 className="section-title">Common questions</h2>
          <div className="card">
            {FAQS.map((f) => (
              <details key={f.q} className="faq">
                <summary>{f.q}<Icon name="ChevronDown" size={18} /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}

export function NewTicket() {
  const { meta, tickets } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const copy = useCopy();
  const { state } = useLocation();
  const initial = params.get('category') || '';
  // Arriving with a category starts a new ticket (pre-filled when it came from a receipt); otherwise pick up the draft.
  const [form, setForm] = useState(() => (!initial && readDraft()) || { category: initial, subject: state?.subject || '', description: '', details: state?.details || '' });
  const [restored] = useState(() => !initial && !!readDraft());
  const [step, setStep] = useState(form.category ? 1 : 0);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  useEffect(() => writeDraft(created ? null : form), [form, created]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const check = (field) => () => setErrors((er) => ({ ...er, [field]: validate(field, form[field]) }));
  const toReview = () => {
    const next = { subject: validate('subject', form.subject), description: validate('description', form.description), details: validate('details', form.details) };
    setErrors(next);
    if (!Object.values(next).some(Boolean)) setStep(2);
    // Take the person straight to the first thing that needs fixing.
    else setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
  };
  const submit = async () => {
    setBusy(true);
    setFailure('');
    try {
      const ticket = await api.createTicket(form);
      setCreated(ticket);
      tickets.reload();
    } catch (err) {
      if (err.field && err.field !== 'category') {
        setErrors((er) => ({ ...er, [err.field]: err.message }));
        setStep(1);
      } else setFailure(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <Page title="Ticket submitted" notes="newticket" narrow>
        <motion.section className="card card-pad grid justify-items-center gap-4 text-center" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
          <span className="avatar" style={{ width: 64, height: 64, background: 'var(--pill-positive-bg)', color: 'var(--pill-positive-ink)' }}><DrawnCheck /></span>
          <div>
            <h2 className="text-xl">We have your ticket</h2>
            <p style={{ color: 'var(--muted)' }}>Keep this reference number. You can follow every step from My tickets.</p>
          </div>
          <div className="flex items-center gap-1 rounded-2xl px-4 py-2" style={{ background: 'var(--raised)' }}>
            <span className="num text-xl font-semibold" style={{ letterSpacing: '0.02em' }}>{created.reference}</span>
            <IconButton icon="Copy" label="Copy reference number" onClick={() => copy(created.reference)} />
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => navigate('/help')}>Back to Help</Button>
            <Button icon="Route" onClick={() => navigate(`/help/tickets/${created.reference}`)}>Track this ticket</Button>
          </div>
        </motion.section>
      </Page>
    );
  }

  const label = meta.categories[form.category];
  const titles = ['What is this about?', 'Tell us what happened', 'Check your ticket'];
  return (
    <Page title="New ticket" notes="newticket" narrow back="/help" rail={<aside className="rail wide-only"><StaySafe link={false} /></aside>}>
      <div className="mb-5 grid gap-2">
        <div className="stepper" role="img" aria-label={`Step ${step + 1} of 3`}>{[0, 1, 2].map((i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Step {step + 1} of 3{restored ? '. We kept your unfinished ticket.' : form.subject.trim() || form.description.trim() ? '. Draft saved on this device.' : ''}
        </p>
        <h2 className="text-xl">{titles[step]}</h2>
      </div>

      {step === 0 && (
        <section className="card">
          {Object.entries(meta.categories).map(([key, text]) => (
            <button key={key} type="button" className="row" style={{ minHeight: 76 }} onClick={() => { setForm((f) => ({ ...f, category: key })); setStep(1); }}>
              <Icon name={CATEGORY_ICON[key]} style={{ color: 'var(--accent-text)', flex: 'none' }} />
              <span className="row-main"><span className="row-title block">{text}</span><span className="block text-sm" style={{ color: 'var(--muted)' }}>{CATEGORY_HELP[key]?.example}</span></span>
              <Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)', flex: 'none' }} />
            </button>
          ))}
        </section>
      )}

      {step === 1 && (
        <section className="card card-pad grid gap-5">
          <div className="flex items-center justify-between gap-3">
            <span className="pill accent"><Icon name={CATEGORY_ICON[form.category]} size={14} />{label || 'Category'}</span>
            <Button variant="ghost" size="sm" onClick={() => setStep(0)}>Change</Button>
          </div>
          <Field label="Subject" error={errors.subject} hint="A short summary, like “Cash in has not arrived”." count={`${form.subject.trim().length}/100`}>
            {(p) => <input {...p} className="input" maxLength={100} value={form.subject} onChange={set('subject')} onBlur={check('subject')} />}
          </Field>
          <Field label="What happened?" error={errors.description} hint={CATEGORY_HELP[form.category]?.hint} count={`${form.description.trim().length}/2000`}>
            {(p) => <textarea {...p} className="textarea" maxLength={2000} value={form.description} onChange={set('description')} onBlur={check('description')} />}
          </Field>
          <Field label="Transaction details" optional error={errors.details} hint="Amount, date or a transaction reference, if you have them.">
            {(p) => <input {...p} className="input" maxLength={300} value={form.details} onChange={set('details')} onBlur={check('details')} />}
          </Field>
          <div className="notice info">
            <Icon name="ShieldCheck" style={{ flex: 'none', marginTop: 2 }} />
            <p>Never include your MPIN, a one-time code or a password. Support will never ask for them.</p>
          </div>
          <Button block onClick={toReview}>Review ticket</Button>
        </section>
      )}

      {step === 2 && (
        <section className="card card-pad grid gap-5">
          <dl className="grid gap-4">
            {[['Category', label, 0], ['Subject', form.subject.trim(), 1], ['What happened', form.description.trim(), 1], ['Transaction details', form.details.trim() || 'None given', 1]].map(([name, text, back]) => (
              <div key={name} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <dt className="text-sm" style={{ color: 'var(--muted)' }}>{name}</dt>
                  <dd className="m-0" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</dd>
                </div>
                <Button variant="ghost" size="sm" disabled={busy} aria-label={`Edit ${name.toLowerCase()}`} onClick={() => setStep(back)}>Edit</Button>
              </div>
            ))}
          </dl>
          {failure && <div className="notice" role="alert"><Icon name="AlertCircle" style={{ flex: 'none', marginTop: 2 }} /><p><strong>Your ticket was not sent</strong>{failure}</p></div>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} disabled={busy}>Back</Button>
            <Button block busy={busy} onClick={submit}>{busy ? 'Sending' : failure ? 'Try again' : 'Submit ticket'}</Button>
          </div>
        </section>
      )}
    </Page>
  );
}

const FILTERS = {
  all: () => true,
  open: (t) => OPEN_STATUSES.includes(t.status),
  action: (t) => t.status === 'waiting_for_customer',
  done: (t) => t.status === 'resolved' || t.status === 'closed',
};

export function Tickets() {
  const { tickets } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const list = tickets.data || [];
  const shown = list.filter((t) => FILTERS[filter](t) && matchesQuery(t, query));
  const count = (key) => list.filter(FILTERS[key]).length;
  return (
    <Page
      title="My tickets"
      notes="tickets"
      narrow
      back="/help"
      actions={<Link className="btn primary sm" to="/help/new"><Icon name="Plus" size={16} /><span className="label">New ticket</span></Link>}
      rail={
        <aside className="rail wide-only">
          <section className="card card-pad grid gap-4">
            <h2 className="text-base">What each stop means</h2>
            <ul className="grid gap-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[...MAIN_STAGES.slice(0, 4), 'waiting_for_customer', ...MAIN_STAGES.slice(4)].map((key) => (
                <li key={key} className="grid justify-items-start gap-1">
                  <StatusPill status={key} />
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>{STATUS[key].help}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      }
    >
      <div className="mb-5 grid gap-3">
        <div className="search">
          <Icon name="Search" size={18} />
          <input className="input" type="search" placeholder="Search by reference or subject" aria-label="Search tickets" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Chips
          label="Filter tickets"
          value={filter}
          onChange={setFilter}
          options={[{ value: 'all', label: 'All', count: count('all') }, { value: 'open', label: 'Open', count: count('open') }, { value: 'action', label: 'Action needed', count: count('action') }, { value: 'done', label: 'Resolved', count: count('done') }]}
        />
      </div>
      <section className="card" aria-live="polite">
        {tickets.loading && !tickets.data ? (
          <SkeletonRows rows={4} />
        ) : tickets.error && !tickets.data ? (
          <LoadError error={tickets.error} onRetry={tickets.reload} />
        ) : list.length === 0 ? (
          <Empty icon="Ticket" title="No tickets yet" action={<Link className="btn primary" to="/help/new">Create a ticket</Link>}>
            When you send us a concern, it appears here with its tracker.
          </Empty>
        ) : shown.length === 0 ? (
          <Empty icon="SearchX" title="No tickets match" action={<Button variant="secondary" onClick={() => { setQuery(''); setFilter('all'); }}>Clear search and filter</Button>}>
            Try a different word, or show all tickets.
          </Empty>
        ) : (
          shown.map((t) => (
            <Link key={t.reference} className="row" to={`/help/tickets/${t.reference}`} style={{ alignItems: 'flex-start', paddingBlock: 16 }}>
              <span className="row-main grid gap-1">
                <span className="flex items-center gap-2">
                  {t.unread && <span className="dot" role="img" aria-label="New update" />}
                  <span className="row-title">{t.subject}</span>
                </span>
                <span className="row-sub"><span className="num">{t.reference}</span>, {t.categoryLabel}</span>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>
                  <span className="block">Submitted {formatDate(t.createdAt)}</span>
                  <span className="block">Updated {formatDateTime(t.updatedAt)}</span>
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2"><StatusPill status={t.status} />{t.isDemo && <span className="demo-tag">Demo record</span>}</span>
              </span>
              <Icon name="ChevronRight" size={18} style={{ color: 'var(--muted)', flex: 'none', marginTop: 4 }} />
            </Link>
          ))
        )}
      </section>
    </Page>
  );
}

// The delivery-style journey. Built only from recorded events: see buildTracker in lib.js.
export function Tracker({ ticket, audience = 'customer' }) {
  const steps = buildTracker(ticket);
  const stateWord = { done: 'Completed', current: 'Current step', waiting: 'Current step', upcoming: 'Not reached yet' };
  return (
    <ol className="tracker">
      {steps.map((s, i) => {
        const active = s.state === 'current' || s.state === 'waiting';
        const label = s.key === 'waiting_for_customer' && audience === 'support' ? 'Waiting for customer' : STATUS[s.key].label;
        return (
          <motion.li
            key={s.key}
            className={`step ${s.state}${s.key === 'resolved' && s.state === 'current' ? ' resolved' : ''}`}
            aria-current={active ? 'step' : undefined}
            style={{ '--i': i }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <span className="step-mark"><Icon name={s.state === 'done' ? 'Check' : statusIcon(s.key)} size={16} /></span>
            <div>
              <div className="step-title">
                {label}
                {active && <span className={`pill ${s.state === 'waiting' ? 'warning' : s.key === 'resolved' ? 'positive' : 'accent'}`}>Now</span>}
                <span className="sr-only">: {stateWord[s.state]}</span>
              </div>
              <div className="step-meta">
                {s.at ? <time dateTime={s.at}>{formatDateTime(s.at)}</time> : 'Upcoming'}
                {active && audience === 'customer' && <span className="block">{STATUS[s.key].help}</span>}
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

const NOTE_TITLE = { waiting_for_customer: 'Support asked for more information', resolved: 'Resolution', in_progress: 'Update from support' };

export function Timeline({ ticket, viewer = 'customer' }) {
  const who = (actor) => (actor === viewer ? 'You' : actor === 'support' ? 'CashG Support' : 'Customer');
  return (
    <ol className="timeline">
      {ticket.events.map((e) => {
        if (e.type === 'message' || e.body) {
          const title = e.type === 'message' ? who(e.actor) : viewer === 'support' ? `${who('support')}: ${STATUS[e.to].short}` : NOTE_TITLE[e.to] || 'Update from support';
          return (
            <li key={e.id} className={`bubble${e.actor === viewer ? ' mine' : ''}`}>
              <div className="bubble-head"><span>{title}</span><time dateTime={e.at}>{formatDateTime(e.at)}</time></div>
              <p>{e.body}</p>
            </li>
          );
        }
        return (
          <li key={e.id} className="event-line">
            <Icon name={statusIcon(e.to)} size={14} style={{ flex: 'none', translate: '0 2px' }} />
            <span>{viewer === 'support' && e.to === 'waiting_for_customer' ? 'Waiting for customer' : STATUS[e.to].label}, <time dateTime={e.at}>{formatDateTime(e.at)}</time></span>
          </li>
        );
      })}
    </ol>
  );
}

export function LongText({ text }) {
  const long = text.length > 400;
  const [open, setOpen] = useState(false);
  return (
    <div className="grid justify-items-start gap-1">
      <p className={`long-text${long && !open ? ' clamped' : ''}`}>{text}</p>
      {long && (
        <button type="button" className="link" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Show less' : 'Show full message'}
        </button>
      )}
    </div>
  );
}

export function Composer({ label, hint, placeholder, disabledReason, onSend }) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (disabledReason) return <p className="text-sm" style={{ color: 'var(--muted)' }}>{disabledReason}</p>;
  const send = async () => {
    if (!body.trim()) return setError('Write a message first.');
    setBusy(true);
    setError('');
    try {
      await onSend(body);
      setBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-3">
      <Field label={label} hint={hint} error={error}>
        {(p) => <textarea {...p} className="textarea" style={{ minHeight: 88 }} maxLength={1000} placeholder={placeholder} value={body} onChange={(e) => setBody(e.target.value)} />}
      </Field>
      <div><Button icon="Send" busy={busy} onClick={send}>{busy ? 'Sending' : 'Send message'}</Button></div>
    </div>
  );
}

export function TicketDetail() {
  const { reference } = useParams();
  const { tickets } = useApp();
  const toast = useToast();
  const copy = useCopy();
  const { data: ticket, error, loading, reload, setData } = useLoad(() => api.ticket(reference), [reference]);
  const seenFor = useRef(null);

  // Opening a ticket counts as reading its updates, which clears the badge.
  useEffect(() => {
    if (!ticket?.unread || seenFor.current === ticket.updatedAt) return;
    seenFor.current = ticket.updatedAt;
    api.markSeen(reference).then(() => tickets.reload(), () => {});
  }, [ticket, reference, tickets]);

  if (loading && !ticket) return <Page title="Ticket" notes="ticket" back="/help/tickets"><div className="card"><SkeletonRows rows={5} /></div></Page>;
  if (error && !ticket) {
    return (
      <Page title="Ticket" notes="ticket" back="/help/tickets">
        <div className="card">
          {error.status === 404 ? (
            <Empty icon="SearchX" title="We could not find that ticket" action={<Link className="btn primary" to="/help/tickets">See my tickets</Link>}>Check the reference number and try again.</Empty>
          ) : (
            <LoadError error={error} onRetry={reload} />
          )}
        </div>
      </Page>
    );
  }

  const waiting = ticket.status === 'waiting_for_customer';
  const reply = async (body) => {
    const next = await api.sendMessage(reference, 'customer', body);
    setData(next);
    tickets.reload();
    toast(waiting ? 'Reply sent. Your ticket is back with support.' : 'Message sent');
  };

  return (
    <Page title={STATUS[ticket.status].label} notes="ticket" back="/help/tickets">
      <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1" style={{ marginTop: -4 }}>
        <span className="num font-semibold">{ticket.reference}</span>
        <IconButton icon="Copy" label="Copy reference number" onClick={() => copy(ticket.reference)} />
        {ticket.isDemo && <span className="demo-tag">Demo record</span>}
      </div>

      {(waiting || ticket.resolutionNote) && (
        <div className="mb-6 grid gap-3">
          {waiting && (
            <div className="notice" role="status">
              <Icon name="MessageCircle" style={{ flex: 'none', marginTop: 2 }} />
              <p><strong>We need a reply from you</strong>Support asked a question below. Your ticket continues as soon as you answer.</p>
            </div>
          )}
          {ticket.resolutionNote && (
            <div className="notice positive">
              <Icon name="Check" style={{ flex: 'none', marginTop: 2 }} />
              <p><strong>How this was resolved</strong>{ticket.resolutionNote}</p>
            </div>
          )}

        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className="card card-pad" aria-label="Ticket progress" data-note="tracker">
          <h2 className="section-title">Progress</h2>
          <Tracker ticket={ticket} />
        </section>

        <div className="grid gap-6">
          <section className="card card-pad grid gap-3">
            <h2 className="text-base">{ticket.subject}</h2>
            <LongText text={ticket.description} />
            <dl className="kv">
              <dt>Category</dt><dd>{ticket.categoryLabel}</dd>
              {ticket.details && (<><dt>Transaction details</dt><dd>{ticket.details}</dd></>)}
              <dt>Submitted</dt><dd>{formatDateTime(ticket.createdAt)}</dd>
              <dt>Last updated</dt><dd>{formatDateTime(ticket.updatedAt)}</dd>
            </dl>
          </section>

          <section className="card card-pad grid gap-5">
            <h2 className="text-base">Activity</h2>
            <Timeline ticket={ticket} />
            <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 16 }}>
              <Composer
                label={waiting ? 'Your reply' : 'Add a message'}
                hint="Support will see this. Never share your MPIN or a one-time code."
                disabledReason={ticket.status === 'closed' ? 'This ticket is closed. If you still need help, open a new ticket.' : ''}
                onSend={reply}
              />
            </div>
          </section>
        </div>
      </div>
    </Page>
  );
}
