// Captures every CashG screen in headless Chrome. Needs the app running.
// Usage: node scripts/screenshots.mjs [baseUrl]   → writes docs/screenshots/*.png
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] || 'http://localhost:4173';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p));
if (!chrome) throw new Error('No Chrome or Edge found');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cashg-shots-'));
const port = 9400 + Math.floor(Math.random() * 500);
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
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
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && waiting.has(msg.id)) waiting.get(msg.id)(msg);
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Runtime.enable');

const SIZES = { phone: { width: 390, height: 844, mobile: true }, desktop: { width: 1366, height: 860, mobile: false } };
const clickText = (text) => `[...document.querySelectorAll('button, a')].find((e) => e.textContent.includes(${JSON.stringify(text)}))?.click()`;

// name, address, optional script to run before the picture
const SCREENS = [
  ['home', '/'],
  ['home-scrolled', '/', `window.scrollTo(0, 430)`],
  ['home-card-back', '/', `document.querySelector('button[aria-label="Show the back of the card"]').click()`],
  ['design-notes', '/', `document.querySelector('button[aria-label="Show design notes"]').click(); setTimeout(() => [...document.querySelectorAll('.note-q')].find((b) => b.textContent.includes('line with dots'))?.click(), 300)`],
  ['scan-qr', '/services/qr'],
  ['savings', '/services/save'],
  ['invest', '/services/invest'],
  ['services', '/services'],
  ['my-tickets-scrolled', '/help/tickets', `window.scrollTo(0, 260)`],
  ['send-amount', '/send', `[...document.querySelectorAll('button.row')].find((b) => b.textContent.includes('Miguel R.')).click()`],
  ['activity', '/activity'],
  ['activity-receipt', '/activity', `document.querySelector('button.row').click()`],
  ['inbox', '/inbox'],
  ['help', '/help'],
  ['new-ticket-errors', '/help/new?category=bills', clickText('Review ticket')],
  ['my-tickets', '/help/tickets'],
  ['ticket-waiting', '/help/tickets/TKT-2026-000002'],
  ['ticket-in-progress', '/help/tickets/TKT-2026-000001'],
  ['ticket-notes', '/help/tickets/TKT-2026-000001', `document.querySelector('button[aria-label="Show design notes"]')?.click()`],
  ['profile', '/profile'],
  ['support-queue', '/support'],
  ['support-ticket', '/support/TKT-2026-000004'],
  ['support-ask-dialog', '/support/TKT-2026-000001', clickText('Ask customer for information')],
];

let count = 0;
for (const [sizeName, size] of Object.entries(SIZES)) {
  await send('Emulation.setDeviceMetricsOverride', { ...size, deviceScaleFactor: 1 });
  for (const theme of ['light', 'dark']) {
    for (const [name, route, action] of SCREENS) {
      // Start each picture from a clean slate so one screen's choices never leak into the next.
      await send('Runtime.evaluate', { expression: `try { localStorage.removeItem('cashg-notes') } catch (e) {}` });
      await send('Page.navigate', { url: BASE + route + (route.includes('?') ? '&' : '?') + 'theme=' + theme });
      await sleep(1500); // lets the opening animations finish
      if (action) {
        await send('Runtime.evaluate', { expression: action });
        await sleep(1500);
      }
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(OUT, `${sizeName}-${theme}-${name}.png`), Buffer.from(shot.result.data, 'base64'));
      count++;
    }
  }
}
console.log(`Saved ${count} screenshots to ${OUT}`);
ws.close();
proc.kill();
await sleep(400);
try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
