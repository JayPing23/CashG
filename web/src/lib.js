// Shared, dependency-free helpers. Tested in lib.test.js.

export const STATUS = {
  submitted: { label: 'Ticket submitted', short: 'Submitted', tone: 'neutral', help: 'We have your ticket and its reference number.' },
  received: { label: 'Received by support', short: 'Received', tone: 'accent', help: 'A support agent has picked up your ticket.' },
  under_review: { label: 'Under review', short: 'Under review', tone: 'accent', help: 'We are checking the details of your concern.' },
  in_progress: { label: 'In progress', short: 'In progress', tone: 'accent', help: 'We are working on a fix.' },
  waiting_for_customer: { label: 'Waiting for you', short: 'Action needed', tone: 'warning', help: 'We need a little more information from you.' },
  resolved: { label: 'Resolved', short: 'Resolved', tone: 'positive', help: 'Your concern has been resolved.' },
  closed: { label: 'Closed', short: 'Closed', tone: 'neutral', help: 'This ticket is closed.' },
};

// The straight road a ticket travels. "Waiting for you" is a side stop, shown only when it happened.
export const MAIN_STAGES = ['submitted', 'received', 'under_review', 'in_progress', 'resolved', 'closed'];

export const OPEN_STATUSES = ['submitted', 'received', 'under_review', 'in_progress', 'waiting_for_customer'];

/**
 * Turns a ticket's recorded events into tracker steps.
 * Every time shown comes from an event; a stage that has not happened has no time.
 * @returns {{key: string, state: 'done'|'current'|'waiting'|'upcoming', at: string|null}[]}
 */
export function buildTracker(ticket) {
  const changes = ticket.events.filter((e) => e.type === 'status_change');
  const lastAt = {};
  for (const e of changes) lastAt[e.to] = e.at;

  const waiting = ticket.status === 'waiting_for_customer';
  const lastWait = waiting ? [...changes].reverse().find((e) => e.to === 'waiting_for_customer') : null;
  const base = waiting ? lastWait.from : ticket.status;
  const current = MAIN_STAGES.indexOf(base);

  const steps = MAIN_STAGES.map((key, i) => {
    let state = 'upcoming';
    if (i < current) state = 'done';
    else if (i === current) state = waiting || ticket.status === 'closed' ? 'done' : 'current';
    return { key, state, at: i <= current ? lastAt[key] ?? null : null };
  });
  if (waiting) steps.splice(current + 1, 0, { key: 'waiting_for_customer', state: 'waiting', at: lastWait.at });
  return steps;
}

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
export const money = (n) => peso.format(n);
export const signedMoney = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + peso.format(Math.abs(n));

const dateTime = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const dateOnly = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const timeOnly = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' });
export const formatDateTime = (iso) => dateTime.format(new Date(iso));
export const formatDate = (iso) => dateOnly.format(new Date(iso));
export const formatTime = (iso) => timeOnly.format(new Date(iso));

export function dayLabel(iso, now = new Date()) {
  const d = new Date(iso);
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(now) - start(d)) / 86400e3);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return dateOnly.format(d);
}

export function matchesQuery(ticket, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [ticket.reference, ticket.subject, ticket.categoryLabel].some((v) => v.toLowerCase().includes(q));
}
