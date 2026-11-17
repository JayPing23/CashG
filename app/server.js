'use strict';
// CashG server: serves the built interface and the ticket API. Built-in Node modules only.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const CATEGORIES = {
  cash_in: 'Cash in',
  send_money: 'Send money',
  bills: 'Bills and payments',
  account: 'Account and verification',
  unauthorized: 'Unauthorized transaction',
  other: 'Something else',
};

const STATUSES = ['submitted', 'received', 'under_review', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'];

// ─── THE CORE RULE OF THE SYSTEM ───────────────────────────────────────────
// Which status may follow which. Edit this map to change the support workflow;
// the interface reads it from /api/meta, so buttons and tracker follow along.
// Run `node --test app/server.test.js` after any change.
const TRANSITIONS = {
  submitted: ['received'],
  received: ['under_review'],
  under_review: ['in_progress', 'waiting_for_customer'],
  in_progress: ['waiting_for_customer', 'resolved'],
  waiting_for_customer: ['in_progress'],
  resolved: ['closed', 'in_progress'], // in_progress here means "reopen"
  closed: [],
};
const NOTE_REQUIRED = ['waiting_for_customer', 'resolved'];
// ───────────────────────────────────────────────────────────────────────────

class HttpError extends Error {
  constructor(status, message, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

function openDb(dbPath) {
  if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      resolution_note TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      customer_seen_at TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS ticket_events (
      id INTEGER PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      actor TEXT NOT NULL CHECK (actor IN ('customer', 'support')),
      type TEXT NOT NULL CHECK (type IN ('status_change', 'message')),
      from_status TEXT,
      to_status TEXT,
      body TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS ticket_events_ticket ON ticket_events(ticket_id, id);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
  if (!db.prepare('SELECT 1 FROM settings WHERE key = ?').get('seeded')) seed(db);
  return db;
}

// A ticket and its event are saved together or not at all.
function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function text(value, field, min, max) {
  const s = typeof value === 'string' ? value.trim() : '';
  if (s.length < min) {
    throw new HttpError(400, min === 1 ? 'This field is required.' : `Please write at least ${min} characters.`, field);
  }
  if (s.length > max) throw new HttpError(400, `Please keep this under ${max} characters.`, field);
  return s;
}

function addEvent(db, ticketId, actor, type, from, to, body, at) {
  db.prepare(
    'INSERT INTO ticket_events (ticket_id, actor, type, from_status, to_status, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(ticketId, actor, type, from, to, body, at);
  db.prepare('UPDATE tickets SET updated_at = ? WHERE id = ?').run(at, ticketId);
}

function nextReference(db, at) {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'ticket_counter'").get();
  const n = (row ? Number(row.value) : 0) + 1;
  db.prepare("INSERT INTO settings (key, value) VALUES ('ticket_counter', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(String(n));
  return `TKT-${at.slice(0, 4)}-${String(n).padStart(6, '0')}`;
}

function createTicket(db, input, opts = {}) {
  const at = opts.at || new Date().toISOString();
  if (!Object.hasOwn(CATEGORIES, input.category)) throw new HttpError(400, 'Choose a category.', 'category');
  const subject = text(input.subject, 'subject', 5, 100);
  const description = text(input.description, 'description', 20, 2000);
  const details = text(input.details ?? '', 'details', 0, 300);
  return tx(db, () => {
    const reference = nextReference(db, at);
    const { lastInsertRowid } = db
      .prepare(
        'INSERT INTO tickets (reference, category, subject, description, details, status, is_demo, created_at, updated_at, customer_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(reference, input.category, subject, description, details, 'submitted', opts.demo ? 1 : 0, at, at, at);
    addEvent(db, lastInsertRowid, 'customer', 'status_change', null, 'submitted', '', at);
    return reference;
  });
}

function findTicket(db, reference) {
  const row = db.prepare('SELECT * FROM tickets WHERE reference = ?').get(String(reference));
  if (!row) throw new HttpError(404, 'We could not find that ticket.');
  return row;
}

function changeStatus(db, reference, to, note, at = new Date().toISOString()) {
  const ticket = findTicket(db, reference);
  if (!(TRANSITIONS[ticket.status] || []).includes(to)) {
    throw new HttpError(409, `A ticket that is "${ticket.status}" cannot move to "${to}".`);
  }
  const body = NOTE_REQUIRED.includes(to) ? text(note, 'note', 5, 1000) : text(note ?? '', 'note', 0, 1000);
  tx(db, () => {
    db.prepare('UPDATE tickets SET status = ?, resolution_note = ? WHERE id = ?').run(
      to,
      to === 'resolved' ? body : to === 'closed' ? ticket.resolution_note : '',
      ticket.id
    );
    addEvent(db, ticket.id, 'support', 'status_change', ticket.status, to, body, at);
  });
}

function addMessage(db, reference, actor, bodyInput, at = new Date().toISOString()) {
  if (actor !== 'customer' && actor !== 'support') throw new HttpError(400, 'Unknown sender.');
  const ticket = findTicket(db, reference);
  if (ticket.status === 'closed') throw new HttpError(409, 'This ticket is closed, so it cannot receive new messages.');
  const body = text(bodyInput, 'body', 1, 1000);
  tx(db, () => {
    addEvent(db, ticket.id, actor, 'message', null, null, body, at);
    // A customer answering a request for information puts the ticket back in support's hands.
    if (actor === 'customer' && ticket.status === 'waiting_for_customer') {
      db.prepare("UPDATE tickets SET status = 'in_progress' WHERE id = ?").run(ticket.id);
      addEvent(db, ticket.id, 'customer', 'status_change', 'waiting_for_customer', 'in_progress', '', at);
    }
    if (actor === 'customer') db.prepare('UPDATE tickets SET customer_seen_at = ? WHERE id = ?').run(at, ticket.id);
  });
}

const UNREAD_SQL = `EXISTS (SELECT 1 FROM ticket_events e WHERE e.ticket_id = t.id AND e.actor = 'support' AND e.created_at > t.customer_seen_at)`;

function toTicket(row) {
  return {
    reference: row.reference,
    category: row.category,
    categoryLabel: CATEGORIES[row.category],
    subject: row.subject,
    description: row.description,
    details: row.details,
    status: row.status,
    resolutionNote: row.resolution_note,
    isDemo: !!row.is_demo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    unread: !!row.unread,
  };
}

function listTickets(db) {
  return db.prepare(`SELECT t.*, ${UNREAD_SQL} AS unread FROM tickets t ORDER BY t.updated_at DESC, t.id DESC`).all().map(toTicket);
}

function getTicket(db, reference) {
  const row = db.prepare(`SELECT t.*, ${UNREAD_SQL} AS unread FROM tickets t WHERE t.reference = ?`).get(String(reference));
  if (!row) throw new HttpError(404, 'We could not find that ticket.');
  const events = db
    .prepare('SELECT id, actor, type, from_status, to_status, body, created_at FROM ticket_events WHERE ticket_id = ? ORDER BY id')
    .all(row.id)
    .map((e) => ({ id: e.id, actor: e.actor, type: e.type, from: e.from_status, to: e.to_status, body: e.body, at: e.created_at }));
  return { ...toTicket(row), events };
}

// Demo records, flagged is_demo so the interface can label them. Times are set relative to first run.
function seed(db) {
  const ago = (hours) => new Date(Date.now() - hours * 3600e3).toISOString();
  const a = createTicket(db, { category: 'cash_in', subject: 'Cash in from bank has not arrived', description: 'I moved 1,500 pesos from my bank app this morning. The bank shows it as successful but my wallet balance has not changed.', details: 'Sample bank transfer, 1,500.00' }, { at: ago(30), demo: true });
  changeStatus(db, a, 'received', '', ago(29));
  changeStatus(db, a, 'under_review', '', ago(26));
  changeStatus(db, a, 'in_progress', 'We found the transfer on our side and are matching it with the bank.', ago(20));
  addMessage(db, a, 'support', 'Quick update: the bank has confirmed the transfer. We are posting it to your wallet now.', ago(3));

  const b = createTicket(db, { category: 'account', subject: 'Verification photo was not accepted', description: 'I tried to verify my account twice and both times the photo of my ID was rejected without a clear reason.' }, { at: ago(50), demo: true });
  changeStatus(db, b, 'received', '', ago(49));
  changeStatus(db, b, 'under_review', '', ago(47));
  changeStatus(db, b, 'waiting_for_customer', 'The ID photo was too dark to read. Could you tell us which ID you used so we can guide you on retaking it?', ago(5));

  const c = createTicket(db, { category: 'bills', subject: 'Electric bill payment was charged twice', description: 'I paid my electric bill once but I can see two identical deductions in my activity list on the same day.', details: 'Sample biller, 2,340.00, charged twice' }, { at: ago(120), demo: true });
  changeStatus(db, c, 'received', '', ago(119));
  changeStatus(db, c, 'under_review', '', ago(110));
  changeStatus(db, c, 'in_progress', '', ago(96));
  changeStatus(db, c, 'resolved', 'The second charge was a duplicate. We returned 2,340.00 to your wallet. You can see it in your activity list.', ago(72));

  createTicket(db, { category: 'send_money', subject: 'Sent money to the wrong number', description: 'I typed one digit wrong and sent 500 pesos to a number I do not know. Is there a way to get it back?', details: 'Sample transfer, 500.00' }, { at: ago(1), demo: true });

  // Mark everything as seen except the two tickets whose latest news the demo should surface.
  db.prepare("UPDATE tickets SET customer_seen_at = updated_at WHERE reference NOT IN (?, ?)").run(a, b);
  db.prepare("INSERT INTO settings (key, value) VALUES ('seeded', '1') ON CONFLICT(key) DO NOTHING").run();
}

function resetDemo(db) {
  tx(db, () => {
    db.exec("DELETE FROM ticket_events; DELETE FROM tickets; DELETE FROM settings;");
  });
  seed(db);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 64 * 1024) {
        reject(new HttpError(413, 'That request is too large.'));
        req.destroy();
      } else chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
        resolve(parsed);
      } catch {
        reject(new HttpError(400, 'The request could not be read.'));
      }
    });
    req.on('error', reject);
  });
}

function createApp({ dbPath, publicDir, clarityProjectId = '' }) {
  const db = openDb(dbPath);
  const root = path.resolve(publicDir);

  function serveStatic(urlPath, res) {
    let rel;
    try {
      rel = decodeURIComponent(urlPath);
    } catch {
      rel = '/';
    }
    let file = path.resolve(root, '.' + rel);
    // Never serve anything outside the public folder.
    if (file !== root && !file.startsWith(root + path.sep)) file = root;
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      // Unknown path without a file extension is a screen inside the app.
      if (path.extname(rel)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not found');
      }
      file = path.join(root, 'index.html');
    }
    if (!fs.existsSync(file)) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('The interface has not been built yet. Run "npm run build" inside the web folder.');
    }
    const immutable = rel.startsWith('/assets/');
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  }

  async function api(req, res, url) {
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(data));
    };
    const m = req.method;
    const p = url.pathname;
    let match;
    if (m !== 'GET' && !String(req.headers['content-type'] || '').startsWith('application/json')) {
      throw new HttpError(415, 'Requests must be sent as JSON.');
    }
    if (m === 'GET' && p === '/api/meta') {
      return send(200, { categories: CATEGORIES, statuses: STATUSES, transitions: TRANSITIONS, noteRequired: NOTE_REQUIRED, clarityProjectId });
    }
    if (m === 'GET' && p === '/api/tickets') return send(200, listTickets(db));
    if (m === 'POST' && p === '/api/tickets') {
      const reference = createTicket(db, await readBody(req));
      return send(201, getTicket(db, reference));
    }
    if (m === 'POST' && p === '/api/reset') {
      resetDemo(db);
      return send(200, { ok: true });
    }
    if ((match = p.match(/^\/api\/tickets\/([A-Za-z0-9-]{1,40})$/)) && m === 'GET') return send(200, getTicket(db, match[1]));
    if ((match = p.match(/^\/api\/tickets\/([A-Za-z0-9-]{1,40})\/(seen|status|messages)$/)) && m === 'POST') {
      const [, reference, action] = match;
      const body = await readBody(req);
      if (action === 'seen') {
        const ticket = findTicket(db, reference);
        db.prepare('UPDATE tickets SET customer_seen_at = ? WHERE id = ?').run(new Date().toISOString(), ticket.id);
      } else if (action === 'status') {
        changeStatus(db, reference, String(body.to), body.note);
      } else {
        addMessage(db, reference, body.actor, body.body);
      }
      return send(200, getTicket(db, reference));
    }
    throw new HttpError(404, 'Not found.');
  }

  // Only this computer may talk to the app. Checking the Host and Origin headers stops a web page
  // on another site from reaching it through the browser (DNS rebinding, cross-site requests).
  const LOCAL = /^(localhost|127\.0\.0\.1)(:\d+)?$/;
  const isLocal = (req) => {
    if (!LOCAL.test(req.headers.host || '')) return false;
    const origin = req.headers.origin;
    if (!origin) return true;
    try {
      return LOCAL.test(new URL(origin).host);
    } catch {
      return false;
    }
  };

  const server = http.createServer((req, res) => {
    if (!isLocal(req)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('CashG only accepts requests from this computer.');
    }
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405);
        return res.end();
      }
      return serveStatic(url.pathname, res);
    }
    api(req, res, url).catch((err) => {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) console.error(err);
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: status === 500 ? 'Something went wrong on our side. Please try again.' : err.message, field: err.field }));
    });
  });
  server.on('close', () => db.close());
  return server;
}

module.exports = { createApp, TRANSITIONS, STATUSES, CATEGORIES };

if (require.main === module) {
  let clarityProjectId = '';
  try {
    clarityProjectId = String(JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')).clarityProjectId || '');
  } catch {
    // No config file: Clarity stays off.
  }
  const server = createApp({
    dbPath: path.join(__dirname, 'data', 'cashg.db'),
    publicDir: path.join(__dirname, 'public'),
    clarityProjectId,
  });
  let port = Number(process.env.PORT) || 4173;
  let attempts = 0;
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempts++ < 20) return server.listen(++port, '127.0.0.1');
    console.error(err.message);
    process.exit(1);
  });
  server.on('listening', () => {
    const address = `http://localhost:${server.address().port}`;
    console.log(`\n  CashG is running at ${address}\n  Keep this window open while you use it. Close it to stop.\n`);
    if (process.argv.includes('--open') && process.platform === 'win32') {
      require('node:child_process').exec(`start "" "${address}"`);
    }
  });
  // 127.0.0.1 only: nothing outside this computer can reach the app.
  server.listen(port, '127.0.0.1');
}
