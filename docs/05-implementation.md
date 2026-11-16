# Implementation

This chapter describes the system as built. Everything here can be checked against the code.

## What was built

| Part | State |
|---|---|
| Support tickets: submit, reference number, My tickets, tracker, messages, Support console | Working, saved in a database |
| Home, All services, Send money, Activity, Inbox, Profile | Design demonstrations with sample data |
| Cash in, Bills, Load, Transfer, QR and other services | A short "design demonstration" sheet each |
| Light, dark and match-device themes | Working |
| Design notes on every screen | Working |
| Login and accounts | Not built, by decision |

## How it fits together

```
Start CashG.bat
  └─ node.exe (shipped in the folder) runs app/server.js
       ├─ serves the built interface from app/public
       ├─ /api/...  ticket rules and validation
       └─ app/data/cashg.db  (SQLite, created on first run)
```

- **Interface:** React, built with Vite. Screens are in `web/src/pages/`. Shared parts (buttons, fields, sheets, toasts, status pills) are in `web/src/ui.jsx`.
- **Design tokens:** every colour, radius and spacing value is named once in `web/src/styles.css`, with a light and a dark value.
- **Server:** one file, `app/server.js`, using only modules built into Node.
- **Database:** SQLite through Node's built-in module. Three tables: `tickets`, `ticket_events`, `settings`.

## The ticket rules

Which stage may follow which is one map near the top of `app/server.js`:

```
submitted            → received
received             → under_review
under_review         → in_progress, waiting_for_customer
in_progress          → waiting_for_customer, resolved
waiting_for_customer → in_progress
resolved             → closed, in_progress (reopen)
closed               → (nothing)
```

- Asking for information and resolving both require a note the customer can read.
- A customer's reply to a request for information moves the ticket back to "in progress" automatically.
- A closed ticket accepts no more changes or messages.
- The interface reads this map from the server, so the Support console only ever offers valid next steps.

## How the tracker stays truthful

Every stage change and message is one row in `ticket_events`, with who did it and when. The tracker is drawn from those rows alone (`buildTracker` in `web/src/lib.js`). A stage that has not happened has no time, and "Waiting for you" appears only if it actually occurred. Nothing on the tracker is estimated or simulated.

## Data safety

- A ticket and its first event are saved together or not at all.
- Input is checked in the form and again in the server: subject 5–100 characters, description 20–2000, details up to 300, category from six fixed options.
- The server accepts connections only from the computer it runs on.
- No MPIN, one-time code or password is requested anywhere.
- Four seeded tickets are flagged as demo records and labelled as such on screen.

## How it is delivered

`scripts/package.ps1` builds a `release/CashG` folder holding the start script, the server, the built interface, a copy of Node and the test guide. A tester extracts it and double-clicks `Start CashG.bat`. Nothing is installed and no internet is needed.

## How it was verified

| Check | What it covers | Result on 17 November 2026 |
|---|---|---|
| `node --test app/server.test.js` | Lifecycle, validation, unique references, restart, reset | 8 of 8 pass |
| `npm test` in `web` | Tracker logic, search, date labels | 6 of 6 pass |
| `node scripts/e2e.mjs` | The real interface in Chrome: 19 steps covering submission, errors, the full support journey, drafts, pre-filled reports, themes, design notes, landmarks and labels on 12 screens, and keyboard reach | 19 of 19 pass |
| Contrast check | 21 text and background pairs across both themes | All pass WCAG AA (lowest 4.65:1) |
| `node scripts/screenshots.mjs` | 18 screens × phone and desktop × light and dark | 72 images in `docs/screenshots` |

Run `node scripts/e2e.mjs --show` to watch the test drive a visible browser.

## Known limitations

- No login: one preset customer, and the Support console is an open link.
- One-click start is Windows only.
- A change made in the Support console appears in the customer app when a screen is opened or the browser tab regains focus, not instantly.
- Node's built-in SQLite module is labelled "release candidate".
- The typeface is Manrope; GCash uses a rounded typeface we could not add.
- Hover styles are not switched off on touch screens, so a tapped row can stay highlighted until the next tap.
