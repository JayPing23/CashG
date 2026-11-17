import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Page, useApp } from '../App.jsx';
import { api, useLoad } from '../api.js';
import { STATUS, formatDate, formatDateTime, matchesQuery } from '../lib.js';
import { Button, Chips, Empty, Field, Icon, LoadError, Sheet, SkeletonRows, StatusPill, useToast } from '../ui.jsx';
import { Composer, LongText, Timeline, Tracker } from './Tickets.jsx';

const IN_WORK = ['received', 'under_review', 'in_progress'];
const FILTERS = {
  all: () => true,
  new: (t) => t.status === 'submitted',
  work: (t) => IN_WORK.includes(t.status),
  waiting: (t) => t.status === 'waiting_for_customer',
  done: (t) => t.status === 'resolved' || t.status === 'closed',
};

export function SupportConsole() {
  const { tickets } = useApp();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const list = tickets.data || [];
  const count = (key) => list.filter(FILTERS[key]).length;
  const shown = list.filter((t) => FILTERS[filter](t) && matchesQuery(t, query));

  const reset = async () => {
    setBusy(true);
    try {
      await api.reset();
      await tickets.reload();
      setConfirmReset(false);
      toast('Demo data restored');
    } catch (err) {
      toast(err.message, 'AlertCircle');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page
      title="Ticket queue"
      subtitle={list.length ? `${count('new')} new ${count('new') === 1 ? 'ticket needs' : 'tickets need'} acknowledging.` : undefined}
      notes="support"
      actions={<Button variant="secondary" size="sm" icon="RotateCcw" onClick={() => setConfirmReset(true)}><span className="label">Reset demo data</span></Button>}
    >
      <div className="grid gap-6">
        <section className="card stat-strip" aria-label="Tickets by stage">
          {[['New', 'new'], ['In work', 'work'], ['Waiting for customer', 'waiting'], ['Resolved or closed', 'done']].map(([label, key]) => (
            <div key={key} className="stat">
              <div className="stat-label">{label}</div>
              <div className="stat-value">{count(key)}</div>
            </div>
          ))}
        </section>

        <section className="card">
          <div className="grid gap-3 p-5 pb-3">
            <div className="search max-w-xl">
              <Icon name="Search" size={18} />
              <input className="input" type="search" placeholder="Search by reference, subject or category" aria-label="Search the queue" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Chips
              label="Filter the queue"
              value={filter}
              onChange={setFilter}
              options={[{ value: 'all', label: 'All', count: count('all') }, { value: 'new', label: 'New', count: count('new') }, { value: 'work', label: 'In work', count: count('work') }, { value: 'waiting', label: 'Waiting', count: count('waiting') }, { value: 'done', label: 'Done', count: count('done') }]}
            />
          </div>
          {tickets.loading && !tickets.data ? (
            <SkeletonRows rows={4} />
          ) : tickets.error && !tickets.data ? (
            <LoadError error={tickets.error} onRetry={tickets.reload} />
          ) : shown.length === 0 ? (
            <Empty icon="Inbox" title={list.length ? 'No tickets match' : 'The queue is empty'}>
              {list.length ? 'Try a different word, or show all tickets.' : 'New tickets appear here as soon as a customer submits one.'}
            </Empty>
          ) : (
            <>
              <div className="queue-head"><span>Reference</span><span>Subject</span><span>Status</span><span>Submitted</span><span>Updated</span></div>
              {shown.map((t) => (
                <Link key={t.reference} className="queue-row" to={`/support/${t.reference}`}>
                  <span className="num text-sm font-semibold">{t.reference}</span>
                  <span className="min-w-0">
                    <span className="row-title block">{t.subject}</span>
                    <span className="row-sub block">{t.categoryLabel}{t.isDemo ? ', demo record' : ''}</span>
                  </span>
                  <span><StatusPill status={t.status} audience="support" /></span>
                  <span className="num text-sm" style={{ color: 'var(--muted)' }}>{formatDate(t.createdAt)}</span>
                  <span className="num text-sm" style={{ color: 'var(--muted)' }}>{formatDateTime(t.updatedAt)}</span>
                </Link>
              ))}
            </>
          )}
        </section>
      </div>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data?">
        <p>This deletes every ticket on this computer, including ones you created, and brings back the four demo tickets. It cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setConfirmReset(false)} disabled={busy}>Keep my tickets</Button>
          <Button variant="danger" block busy={busy} onClick={reset}>Delete and reset</Button>
        </div>
      </Sheet>
    </Page>
  );
}

// What each allowed move is called, from the agent's point of view.
function actionFor(from, to) {
  if (to === 'received') return { label: 'Acknowledge ticket', icon: 'Inbox' };
  if (to === 'under_review') return { label: 'Start review', icon: 'Search' };
  if (to === 'waiting_for_customer') return { label: 'Ask customer for information', icon: 'MessageCircle', variant: 'secondary', prompt: 'What do you need from the customer?' };
  if (to === 'resolved') return { label: 'Mark as resolved', icon: 'Check', prompt: 'What was done to resolve this? The customer will see it.' };
  if (to === 'closed') return { label: 'Close ticket', icon: 'Archive', confirm: 'A closed ticket cannot be reopened or receive messages.' };
  if (to === 'in_progress') {
    if (from === 'resolved') return { label: 'Reopen ticket', icon: 'RotateCcw', variant: 'secondary' };
    if (from === 'waiting_for_customer') return { label: 'Continue without a reply', icon: 'Wrench', variant: 'secondary' };
    return { label: 'Start working on it', icon: 'Wrench' };
  }
  return { label: STATUS[to]?.label || to, icon: 'ArrowRight' };
}

export function SupportTicket() {
  const { reference } = useParams();
  const { tickets, meta } = useApp();
  const toast = useToast();
  const { data: ticket, error, loading, reload, setData } = useLoad(() => api.ticket(reference), [reference]);
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [busy, setBusy] = useState('');

  if (loading && !ticket) return <Page title="Ticket" notes="supportticket" back="/support"><div className="card"><SkeletonRows rows={5} /></div></Page>;
  if (error && !ticket) {
    return (
      <Page title="Ticket" notes="supportticket" back="/support">
        <div className="card">
          {error.status === 404 ? <Empty icon="SearchX" title="No ticket has that reference" action={<Link className="btn primary" to="/support">Back to the queue</Link>} /> : <LoadError error={error} onRetry={reload} />}
        </div>
      </Page>
    );
  }

  const moves = (meta.transitions[ticket.status] || []).map((to) => ({ to, ...actionFor(ticket.status, to) }));

  const apply = async (to, text) => {
    setBusy(to);
    setNoteError('');
    try {
      const next = await api.setStatus(reference, to, text);
      setData(next);
      tickets.reload();
      setPending(null);
      setNote('');
      toast(`Ticket is now “${to === 'waiting_for_customer' ? 'Waiting for customer' : STATUS[to].label}”`);
    } catch (err) {
      if (err.field === 'note') setNoteError(err.message);
      else {
        toast(err.message, 'AlertCircle');
        reload();
      }
    } finally {
      setBusy('');
    }
  };
  const choose = (move) => (move.prompt || move.confirm ? (setNote(''), setNoteError(''), setPending(move)) : apply(move.to, ''));
  const send = async (body) => {
    setData(await api.sendMessage(reference, 'support', body));
    tickets.reload();
    toast('Message sent to the customer');
  };

  return (
    <Page title={ticket.subject} notes="supportticket" back="/support">
      <div className="mb-5 flex flex-wrap items-center gap-2" style={{ marginTop: -4 }}>
        <span className="num font-semibold">{ticket.reference}</span>
        <StatusPill status={ticket.status} audience="support" />
        {ticket.isDemo && <span className="demo-tag">Demo record</span>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-6">
          <section className="card card-pad grid gap-3">
            <h2 className="text-base">Customer concern</h2>
            <LongText text={ticket.description} />
            <dl className="kv">
              <dt>Category</dt><dd>{ticket.categoryLabel}</dd>
              <dt>Transaction details</dt><dd>{ticket.details || 'None given'}</dd>
              <dt>Submitted</dt><dd>{formatDateTime(ticket.createdAt)}</dd>
            </dl>
          </section>
          <section className="card card-pad grid gap-5">
            <h2 className="text-base">History</h2>
            <Timeline ticket={ticket} viewer="support" />
            <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 16 }}>
              <Composer
                label="Message to customer"
                hint="Visible to the customer on their ticket."
                disabledReason={ticket.status === 'closed' ? 'This ticket is closed and cannot receive messages.' : ''}
                onSend={send}
              />
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          <section className="card card-pad grid gap-3">
            <h2 className="text-base">Next step</h2>
            {moves.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>This ticket is closed. Nothing more can be done on it.</p>
            ) : (
              moves.map((m) => (
                <Button key={m.to} block variant={m.variant || 'primary'} icon={m.icon} busy={busy === m.to} disabled={!!busy} onClick={() => choose(m)}>
                  {m.label}
                </Button>
              ))
            )}
          </section>
          <section className="card card-pad">
            <h2 className="section-title">What the customer sees</h2>
            <Tracker ticket={ticket} audience="support" />
          </section>
        </div>
      </div>

      <Sheet open={!!pending} onClose={() => setPending(null)} title={pending?.label || ''}>
        {pending?.prompt ? (
          <Field label={pending.prompt} error={noteError} hint="Visible to the customer.">
            {(p) => <textarea {...p} className="textarea" maxLength={1000} autoFocus value={note} onChange={(e) => setNote(e.target.value)} />}
          </Field>
        ) : (
          <p>{pending?.confirm}</p>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setPending(null)} disabled={!!busy}>Cancel</Button>
          <Button block busy={!!busy} onClick={() => apply(pending.to, note)}>{pending?.label}</Button>
        </div>
      </Sheet>
    </Page>
  );
}
