'use strict';
// Run with: node --test app/server.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp, TRANSITIONS, STATUSES } = require('./server.js');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cashg-test-'));
const dbPath = path.join(dir, 'test.db');
let server;
let base;

function start() {
  return new Promise((resolve) => {
    server = createApp({ dbPath, publicDir: path.join(dir, 'public') });
    server.listen(0, '127.0.0.1', () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
}
const stop = () => new Promise((resolve) => server.close(resolve));

async function call(method, url, body) {
  const res = await fetch(base + url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
}

const valid = { category: 'cash_in', subject: 'Cash in is missing', description: 'I cashed in this morning and the money has not arrived yet.' };

test.before(start);
test.after(async () => {
  await stop();
  fs.rmSync(dir, { recursive: true, force: true });
});

test('every status in the transition map is a known status', () => {
  for (const [from, list] of Object.entries(TRANSITIONS)) {
    assert.ok(STATUSES.includes(from));
    for (const to of list) assert.ok(STATUSES.includes(to));
  }
});

test('first run seeds demo tickets that are flagged as demo', async () => {
  const { data } = await call('GET', '/api/tickets');
  assert.ok(data.length >= 4);
  assert.ok(data.every((t) => t.isDemo));
});

test('rejects invalid tickets and names the field', async () => {
  let r = await call('POST', '/api/tickets', { ...valid, category: 'nope' });
  assert.equal(r.status, 400);
  assert.equal(r.data.field, 'category');
  r = await call('POST', '/api/tickets', { ...valid, subject: 'Hi' });
  assert.equal(r.data.field, 'subject');
  r = await call('POST', '/api/tickets', { ...valid, description: 'too short' });
  assert.equal(r.data.field, 'description');
});

test('references are unique and well formed', async () => {
  const a = await call('POST', '/api/tickets', valid);
  const b = await call('POST', '/api/tickets', valid);
  assert.equal(a.status, 201);
  assert.match(a.data.reference, /^TKT-\d{4}-\d{6}$/);
  assert.notEqual(a.data.reference, b.data.reference);
  assert.equal(a.data.isDemo, false);
});

test('full lifecycle is recorded event by event', async () => {
  const { data: t } = await call('POST', '/api/tickets', valid);
  const ref = t.reference;
  const status = (to, note) => call('POST', `/api/tickets/${ref}/status`, { to, note });

  // Skipping a step is refused.
  assert.equal((await status('resolved', 'Fixed it for you.')).status, 409);

  assert.equal((await status('received')).status, 200);
  assert.equal((await status('under_review')).status, 200);

  // Asking for information needs a note the customer can read.
  assert.equal((await status('waiting_for_customer')).data.field, 'note');
  let r = await status('waiting_for_customer', 'Which bank did you use?');
  assert.equal(r.data.status, 'waiting_for_customer');
  assert.equal(r.data.unread, true);

  // Opening the ticket clears the badge.
  r = await call('POST', `/api/tickets/${ref}/seen`, {});
  assert.equal(r.data.unread, false);

  // The customer's reply hands the ticket back to support.
  r = await call('POST', `/api/tickets/${ref}/messages`, { actor: 'customer', body: 'I used Sample Bank.' });
  assert.equal(r.data.status, 'in_progress');

  // Resolving needs a note, which becomes the resolution.
  assert.equal((await status('resolved')).status, 400);
  r = await status('resolved', 'The cash in has been posted to your wallet.');
  assert.equal(r.data.resolutionNote, 'The cash in has been posted to your wallet.');

  r = await status('closed');
  assert.equal(r.data.status, 'closed');
  assert.equal(r.data.resolutionNote, 'The cash in has been posted to your wallet.');

  // Closed is final.
  assert.equal((await status('in_progress')).status, 409);
  assert.equal((await call('POST', `/api/tickets/${ref}/messages`, { actor: 'customer', body: 'Hello?' })).status, 409);

  // The history holds exactly what happened, in order.
  const path = r.data.events.filter((e) => e.type === 'status_change').map((e) => e.to);
  assert.deepEqual(path, ['submitted', 'received', 'under_review', 'waiting_for_customer', 'in_progress', 'resolved', 'closed']);
  assert.ok(r.data.events.every((e) => !Number.isNaN(Date.parse(e.at))));
});

test('bad requests get clear answers', async () => {
  assert.equal((await call('GET', '/api/tickets/TKT-0000-999999')).status, 404);
  const res = await fetch(base + '/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{not json' });
  assert.equal(res.status, 400);
  const form = await fetch(base + '/api/tickets', { method: 'POST', body: 'a=b' });
  assert.equal(form.status, 415);
  const traversal = await fetch(base + '/..%2f..%2fserver.js');
  assert.notEqual(traversal.status, 200);
});

test('requests addressed to another host or sent from another site are refused', async () => {
  const http = require('node:http');
  const { port } = new URL(base);
  const status = (headers) => new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: '/api/tickets', headers }, (res) => { res.resume(); resolve(res.statusCode); }).on('error', reject);
  });
  assert.equal(await status({ Host: 'evil.example:' + port }), 403);
  assert.equal(await status({ Host: 'localhost:' + port, Origin: 'https://evil.example' }), 403);
  assert.equal(await status({ Host: 'localhost:' + port, Origin: 'http://localhost:' + port }), 200);
  assert.equal(await status({ Host: '127.0.0.1:' + port }), 200);
});

test('tickets survive a restart', async () => {
  const { data: t } = await call('POST', '/api/tickets', valid);
  await stop();
  await start();
  const r = await call('GET', `/api/tickets/${t.reference}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.subject, valid.subject);
});

test('reset returns the demo data', async () => {
  await call('POST', '/api/reset', {});
  const { data } = await call('GET', '/api/tickets');
  assert.equal(data.length, 4);
  assert.ok(data.every((t) => t.isDemo));
});
