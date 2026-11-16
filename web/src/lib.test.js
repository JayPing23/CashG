import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTracker, matchesQuery, dayLabel } from './lib.js';

const change = (from, to, at) => ({ type: 'status_change', from, to, at, body: '' });
const states = (ticket) => buildTracker(ticket).map((s) => `${s.key}:${s.state}`);

test('a new ticket shows one current step and no invented times', () => {
  const steps = buildTracker({ status: 'submitted', events: [change(null, 'submitted', 't0')] });
  assert.equal(steps[0].state, 'current');
  assert.equal(steps[0].at, 't0');
  assert.ok(steps.slice(1).every((s) => s.state === 'upcoming' && s.at === null));
});

test('waiting appears as a side stop after the stage it came from', () => {
  const ticket = {
    status: 'waiting_for_customer',
    events: [change(null, 'submitted', 't0'), change('submitted', 'received', 't1'), change('received', 'under_review', 't2'), change('under_review', 'waiting_for_customer', 't3')],
  };
  assert.deepEqual(states(ticket), [
    'submitted:done', 'received:done', 'under_review:done', 'waiting_for_customer:waiting',
    'in_progress:upcoming', 'resolved:upcoming', 'closed:upcoming',
  ]);
  // In progress never happened, so it must not carry a time.
  assert.equal(buildTracker(ticket).find((s) => s.key === 'in_progress').at, null);
});

test('a reopened ticket goes back to in progress and un-resolves', () => {
  const ticket = {
    status: 'in_progress',
    events: [
      change(null, 'submitted', 't0'), change('submitted', 'received', 't1'), change('received', 'under_review', 't2'),
      change('under_review', 'in_progress', 't3'), change('in_progress', 'resolved', 't4'), change('resolved', 'in_progress', 't5'),
    ],
  };
  const steps = buildTracker(ticket);
  assert.equal(steps.find((s) => s.key === 'in_progress').state, 'current');
  assert.equal(steps.find((s) => s.key === 'in_progress').at, 't5');
  assert.equal(steps.find((s) => s.key === 'resolved').state, 'upcoming');
  assert.equal(steps.find((s) => s.key === 'resolved').at, null);
});

test('a closed ticket has every step done', () => {
  const order = ['submitted', 'received', 'under_review', 'in_progress', 'resolved', 'closed'];
  const events = order.map((to, i) => change(order[i - 1] ?? null, to, `t${i}`));
  assert.ok(buildTracker({ status: 'closed', events }).every((s) => s.state === 'done' && s.at));
});

test('search matches reference, subject and category', () => {
  const t = { reference: 'TKT-2026-000007', subject: 'Cash in missing', categoryLabel: 'Cash in' };
  assert.ok(matchesQuery(t, '000007'));
  assert.ok(matchesQuery(t, ' MISSING '));
  assert.ok(matchesQuery(t, ''));
  assert.ok(!matchesQuery(t, 'bills'));
});

test('day labels', () => {
  const now = new Date(2026, 10, 17, 9);
  assert.equal(dayLabel(new Date(2026, 10, 17, 1).toISOString(), now), 'Today');
  assert.equal(dayLabel(new Date(2026, 10, 16, 23).toISOString(), now), 'Yesterday');
});
