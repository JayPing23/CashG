// Worst-case data test: starts a throwaway copy of the app, fills it with realistic extreme tickets
// through the real API, and photographs the screens at a narrow phone width.
// Usage: node scripts/break.mjs   → writes docs/screenshots/break-*.png   (the real database is not touched)
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { createApp } = createRequire(import.meta.url)(path.join(root, 'app', 'server.js'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cashg-break-'));
const server = createApp({ dbPath: path.join(tmp, 'break.db'), publicDir: path.join(root, 'app', 'public') });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://localhost:${server.address().port}`;
const post = (url, body) => fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());

// Realistic extremes: the longest values the server accepts, strings with no spaces, markup-looking text,
// emoji, the shortest allowed values, and a long list.
const longWord = 'PinagsamangKooperatibaNgMgaMagsasakaAtMangingisdaNgHilagangLuzon';
const long = await post('/api/tickets', {
  category: 'unauthorized',
  subject: `Bayad sa ${longWord} hindi nai-post kahapon`.slice(0, 100),
  description: ('Nagbayad ako sa https://bayad.example.com/resibo/2026/11/17/000111222333444555666777888999000111222333?ref=ABCDEFGHIJKLMNOPQRSTUVWXYZ pero wala pa rin. <b>Hindi ito bold</b> & **hindi rin ito**. 😤🙏 ' + 'Paulit-ulit kong sinubukan at ganoon pa rin ang nangyayari sa bawat pagkakataon. '.repeat(30)).slice(0, 2000),
  details: ('REF-000111222333444555666777888999000111222333444555666777888999-' + 'X'.repeat(300)).slice(0, 300),
});
await post(`/api/tickets/${long.reference}/status`, { to: 'received' });
await post(`/api/tickets/${long.reference}/status`, { to: 'under_review' });
await post(`/api/tickets/${long.reference}/status`, { to: 'waiting_for_customer', note: ('Pakisagot po: ano ang eksaktong oras ng bayad at saang sangay? ' + longWord + ' ').repeat(12).slice(0, 1000) });
await post('/api/tickets', { category: 'other', subject: 'Help!', description: 'Nawala ang pera ko!!' });
for (let i = 0; i < 60; i++) await post('/api/tickets', { category: 'bills', subject: `Bill number ${i + 1} was charged twice`, description: 'The same bill appears two times in my activity list.' });

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p));
const port = 9400 + Math.floor(Math.random() * 500);
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(tmp, 'profile')}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250);
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page');
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const waiting = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && waiting.has(msg.id)) waiting.get(msg.id)(msg); };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Runtime.enable');

const out = path.join(root, 'docs', 'screenshots');
const shots = [
  ['home', '/', 320], ['tickets', '/help/tickets', 320], ['ticket', `/help/tickets/${long.reference}`, 320],
  ['ticket-lower', `/help/tickets/${long.reference}`, 320, 900], ['support', '/support', 320], ['support-desktop', '/support', 1366],
];
const overflow = [];
for (const [name, route, width, scroll] of shots) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: width < 600 });
  await send('Page.navigate', { url: BASE + route + '?theme=light' });
  await sleep(1200);
  if (scroll) { await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${scroll})` }); await sleep(300); }
  // The page must never be wider than the screen, whatever the data.
  const r = await send('Runtime.evaluate', { expression: 'document.documentElement.scrollWidth - window.innerWidth', returnByValue: true });
  if (r.result.result.value > 0) overflow.push(`${name}: ${r.result.result.value}px wider than the screen`);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(out, `break-${name}.png`), Buffer.from(shot.result.data, 'base64'));
}
console.log(overflow.length ? 'Sideways overflow:\n  ' + overflow.join('\n  ') : 'No sideways overflow on any screen.');
ws.close();
proc.kill();
server.close();
await sleep(500);
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
process.exit(overflow.length ? 1 : 0);
