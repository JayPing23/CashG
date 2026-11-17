// Drives the real CashG interface in headless Chrome over the DevTools protocol. No packages needed.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Add --show to watch it happen in a visible window, slowed down, with a picture saved after each step.
const SHOW = process.argv.includes('--show');
const BASE = process.argv.slice(2).find((a) => a.startsWith('http')) || 'http://localhost:4173';
const SHOTS = path.join(os.tmpdir(), 'cashg-e2e-shots');
if (SHOW) fs.mkdirSync(SHOTS, { recursive: true });
const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p));
if (!chrome) throw new Error('No Chrome or Edge found');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cashg-e2e-'));
// A random port, so a run never attaches to a browser left open by an earlier run.
const port = 9400 + Math.floor(Math.random() * 500);
const proc = spawn(chrome, [...(SHOW ? ['--new-window', '--no-first-run', '--no-default-browser-check'] : ['--headless=new']), `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--window-size=1280,900', 'about:blank'], { stdio: 'ignore', detached: SHOW });
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
const problems = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && waiting.has(msg.id)) waiting.get(msg.id)(msg);
  if (msg.method === 'Runtime.exceptionThrown') problems.push('exception: ' + msg.params.exceptionDetails.exception?.description);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') problems.push('console.error: ' + msg.params.args.map((a) => a.value || a.description).join(' '));
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable');
await send('Page.enable');

const HELPERS = `
  window.__byText = (text, sel = 'button, a') => [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null || e.closest('dialog[open]')).find((e) => e.textContent.trim() === text || e.textContent.trim().startsWith(text));
  window.__click = (text, sel) => { const e = __byText(text, sel); if (!e) throw new Error('no element: ' + text); e.click(); };
  window.__fill = (labelText, value) => {
    const label = [...document.querySelectorAll('label')].find((l) => l.textContent.trim().startsWith(labelText));
    if (!label) throw new Error('no label: ' + labelText);
    const el = document.getElementById(label.htmlFor);
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  window.__has = (text) => document.body.innerText.includes(text);
`;
const run = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${HELPERS}; return (${expr}); })()`, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval failed');
  if (SHOW) await sleep(700);
  return r.result.result.value;
};
const go = async (p) => { await send('Page.navigate', { url: BASE + p }); await sleep(SHOW ? 1800 : 900); };
const until = async (expr, what) => {
  for (let i = 0; i < 40; i++) { if (await run(expr)) return; await sleep(150); }
  throw new Error('timed out waiting for: ' + what);
};

let passed = 0;
const failed = [];
const step = async (name, fn) => {
  try { await fn(); passed++; console.log('  ok   ' + name); } catch (e) { failed.push(name); console.log('  FAIL ' + name + ' :: ' + e.message.split('\n')[0]); }
};
const quietStep = step;
let stepNumber = 0;
// In --show mode, pause after each step and keep a picture of what the screen looked like.
const shownStep = async (name, fn) => {
  await quietStep(name, fn);
  if (!SHOW) return;
  await sleep(1200);
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
  fs.writeFileSync(path.join(SHOTS, String(++stepNumber).padStart(2, '0') + '.jpg'), Buffer.from(shot.result.data, 'base64'));
};

let ref = '';
try {
  await shownStep('empty form shows field errors and stays put', async () => {
    await go('/help/new?category=bills');
    await run(`__click('Review ticket')`);
    await until(`__has('Give your ticket a short subject.') && __has('Tell us what happened.')`, 'field errors');
  });
  await shownStep('filled form reaches review', async () => {
    await run(`(__fill('Subject', 'Water bill charged twice'), __fill('What happened?', 'I paid my water bill once but two deductions appear on the same day.'), __click('Review ticket'))`);
    await until(`__has('Check your ticket')`, 'review step');
  });
  await shownStep('submit shows a reference number', async () => {
    await run(`__click('Submit ticket')`);
    await until(`__has('We have your ticket')`, 'confirmation');
    ref = await run(`document.body.innerText.match(/TKT-\\d{4}-\\d{6}/)[0]`);
  });
  await shownStep('ticket appears in My tickets and search finds it', async () => {
    await go('/help/tickets');
    await until(`__has('${ref}')`, 'ticket in list');
    await run(`(() => { const el = document.querySelector('input[type=search]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'zzzz'); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await until(`__has('No tickets match')`, 'empty search state');
  });
  await shownStep('support: acknowledge and start review', async () => {
    await go('/support/' + ref);
    await until(`!!__byText('Acknowledge ticket')`, 'acknowledge button');
    await run(`__click('Acknowledge ticket')`);
    await until(`!!__byText('Start review')`, 'start review button');
    await run(`__click('Start review')`);
    await until(`!!__byText('Ask customer for information')`, 'ask button');
  });
  await shownStep('support: asking for information requires a note', async () => {
    await run(`__click('Ask customer for information')`);
    await until(`!!document.querySelector('dialog[open] textarea')`, 'note dialog');
    await run(`[...document.querySelectorAll('dialog[open] button')].find((b) => b.textContent.includes('Ask customer')).click()`);
    await until(`__has('Please write at least 5 characters.')`, 'note error');
    await run(`(__fill('What do you need', 'Which date did you pay the bill?'), [...document.querySelectorAll('dialog[open] button')].find((b) => b.textContent.includes('Ask customer')).click())`);
    await until(`!document.querySelector('dialog[open]') && __has('Waiting for customer')`, 'waiting status');
  });
  await shownStep('customer: sees the request, badge shows, reply returns ticket to In progress', async () => {
    await go('/');
    await until(`!!document.querySelector('.badge')`, 'unread badge on Help');
    await go('/help/tickets/' + ref);
    await until(`__has('We need a reply from you') && __has('Which date did you pay the bill?')`, 'action banner and question');
    await run(`(__fill('Your reply', 'I paid on the 14th.'), __click('Send message'))`);
    await until(`document.querySelector('h1').textContent === 'In progress'`, 'in progress title');
  });
  await shownStep('support: resolve with a note; customer reads the resolution', async () => {
    await go('/support/' + ref);
    await until(`!!__byText('Mark as resolved')`, 'resolve button');
    await run(`__click('Mark as resolved')`);
    await until(`!!document.querySelector('dialog[open] textarea')`, 'resolve dialog');
    await run(`(__fill('What was done', 'We returned the duplicate charge to your wallet.'), [...document.querySelectorAll('dialog[open] button')].find((b) => b.textContent.includes('Mark as resolved')).click())`);
    await until(`!document.querySelector('dialog[open]')`, 'dialog closed');
    await go('/help/tickets/' + ref);
    await until(`__has('How this was resolved') && __has('We returned the duplicate charge to your wallet.')`, 'resolution note');
  });
  await shownStep('ticket survives a full reload', async () => {
    await go('/help/tickets/' + ref);
    await until(`document.querySelector('h1').textContent === 'Resolved'`, 'resolved after reload');
  });
  await shownStep('theme switch applies and is remembered', async () => {
    await go('/profile');
    await run(`[...document.querySelectorAll('[role=radio]')].find((b) => b.textContent.trim() === 'Dark').click()`);
    await until(`document.documentElement.dataset.theme === 'dark'`, 'dark theme');
    await go('/');
    await until(`document.documentElement.dataset.theme === 'dark'`, 'dark theme kept after reload');
    await go('/profile');
    await run(`[...document.querySelectorAll('[role=radio]')].find((b) => b.textContent.trim() === 'Light').click()`);
    await until(`document.documentElement.dataset.theme === 'light' && getComputedStyle(document.documentElement).backgroundColor === 'rgb(240, 244, 250)'`, 'light theme colours');
  });
  await shownStep('design notes open with content', async () => {
    await run(`document.querySelector('button[aria-label="Show design notes"]').click()`);
    await until(`!!document.querySelector('.notes li')`, 'notes panel');
  });
  await shownStep('send money demo: validates, reviews, ends in a demo screen', async () => {
    await go('/send');
    await run(`__click('Continue')`);
    await until(`__has('Enter an 11-digit mobile number')`, 'mobile error');
    await run(`[...document.querySelectorAll('button.row')].find((b) => b.textContent.includes('Miguel R.')).click()`);
    await until(`__has('How much?')`, 'amount step');
    await run(`(__fill('Amount in pesos', '999999'), __click('Review'))`);
    await until(`__has('That is more than your balance')`, 'over-balance error');
    await run(`(__fill('Amount in pesos', '250'), __click('Review'))`);
    await until(`__has('Check before you send')`, 'review step');
    await run(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('Send ₱')).click()`);
    await until(`__has('no money was sent')`, 'demo receipt');
  });
  await shownStep('a service opens its own designed page, and its buttons say they are a demo', async () => {
    await go('/services');
    await run(`[...document.querySelectorAll('button.row')].find((b) => b.textContent.includes('Pay electricity')).click()`);
    await until(`location.pathname === '/services/bills' && __has('Saved billers') && __has('Design demonstration')`, 'bills page');
    await run(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Pay').click()`);
    await until(`__has('is a demo')`, 'demo toast');
  });
  await shownStep('a number typed as +63 is accepted and tidied', async () => {
    await go('/send');
    await run(`(__fill('Mobile number', '+63 917-555-0142'), __click('Continue'))`);
    await until(`__has('How much?') && __has('0917 555 0142')`, 'normalised number on the amount step');
  });
  await shownStep('reporting from a receipt pre-fills the ticket', async () => {
    await go('/activity');
    await run(`document.querySelector('button.row').click()`);
    await until(`!!document.querySelector('dialog[open]')`, 'receipt sheet');
    await run(`[...document.querySelectorAll('dialog[open] a')].find((a) => a.textContent.includes('Report a problem')).click()`);
    await until(`__has('Tell us what happened') && document.querySelector('input.input').value.startsWith('Problem with: ')`, 'pre-filled subject');
    await until(`[...document.querySelectorAll('input.input')].some((i) => i.value.includes('₱'))`, 'pre-filled transaction details');
  });
  await shownStep('an unfinished ticket is kept as a draft and offered again', async () => {
    await run(`__fill('What happened?', 'Typing something and then leaving the form.')`);
    await go('/help');
    await until(`__has('Finish your ticket')`, 'draft reminder on Help');
    await run(`__click('Finish your ticket', 'a')`);
    await until(`document.querySelector('textarea').value === 'Typing something and then leaving the form.' && __has('We kept your unfinished ticket')`, 'restored draft');
  });
  await shownStep('rendered pages have landmarks, one h1, labelled fields and named controls', async () => {
    const audit = `(() => {
      const problems = [];
      if (document.querySelectorAll('h1').length !== 1) problems.push('h1 count ' + document.querySelectorAll('h1').length);
      if (!document.querySelector('main')) problems.push('no main');
      if (!document.querySelector('nav')) problems.push('no nav');
      if (!document.querySelector('a[href="#main"]')) problems.push('no skip link');
      for (const el of document.querySelectorAll('input, textarea, select')) {
        if (!(el.labels && el.labels.length) && !el.getAttribute('aria-label')) problems.push('unlabelled ' + el.tagName);
      }
      for (const el of document.querySelectorAll('button, a')) {
        if (!(el.textContent.trim() || el.getAttribute('aria-label'))) problems.push('unnamed ' + el.tagName + ' ' + el.className);
      }
      for (const el of document.querySelectorAll('img')) if (!el.hasAttribute('alt')) problems.push('img without alt');
      return problems.join('; ');
    })()`;
    const found = [];
    for (const route of ['/', '/services', '/send', '/activity', '/inbox', '/profile', '/help', '/help/new?category=bills', '/help/tickets', '/help/tickets/' + ref, '/support', '/support/' + ref]) {
      await go(route);
      const result = await run(audit);
      if (result) found.push(route + ' -> ' + result);
    }
    if (found.length) throw new Error(found.join(' | '));
  });
  await shownStep('keyboard: Tab moves through the form and reaches its button with a visible focus ring', async () => {
    await go('/help/new?category=bills');
    const press = (key, code) => send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: 9 }).then(() => send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: 9 }));
    await until(`document.activeElement === document.querySelector('h1')`, 'focus placed on the screen title');
    let reached = false;
    for (let i = 0; i < 40 && !reached; i++) {
      await press('Tab', 'Tab');
      reached = await run(`document.activeElement.textContent.trim() === 'Review ticket'`);
    }
    if (!reached) throw new Error('Review ticket button not reachable by Tab');
    const ring = await run(`getComputedStyle(document.activeElement).outlineStyle !== 'none'`);
    if (!ring) throw new Error('focused button has no visible focus ring');
  });
  await shownStep('unknown address shows a not-found screen', async () => {
    await go('/nope');
    await until(`__has('This screen does not exist')`, 'not found');
  });
} finally {
  console.log(`\n${passed} passed, ${failed.length} failed. Reference used: ${ref || 'none'}`);
  console.log(problems.length ? 'Browser problems:\n  ' + [...new Set(problems)].join('\n  ') : 'No browser errors or exceptions.');
  if (SHOW) {
    // Leave the window open on Home so the person watching can keep exploring.
    await go('/');
    console.log('Pictures of each step: ' + SHOTS);
    console.log('The browser window stays open. Close it when you are done.');
    ws.close();
    proc.unref();
  } else {
    ws.close();
    proc.kill();
    await sleep(400);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
  process.exit(failed.length ? 1 : 0);
}
