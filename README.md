# CashG

An academic redesign concept for a GCash-inspired e-wallet, with a working support ticket system that is tracked like a parcel delivery. Built for a university UI/UX course. **Not affiliated with GCash.** All data is sample data.

## What is real and what is a demonstration

| Part | State |
|---|---|
| Support tickets: submit, reference number, My tickets, tracker, messages, Support console | Working, saved in a database |
| Home, All services, Send money, Activity, Inbox, Profile | Design demonstrations with sample data |
| Light, dark and match-device theme; design notes | Working |
| Login, real money, anything connected to GCash | Not included |

## Run it

Needs Node.js 24 or newer (it uses Node's built-in SQLite).

First time only:

```
cd web
npm install
npm run build
```

Then double-click **Start CashG.bat**, or run:

```
node app/server.js --open
```

The app opens at http://localhost:4173 (or the next free port). It only accepts connections from this computer.

## Share it with testers

```
powershell -ExecutionPolicy Bypass -File scripts\package.ps1
```

This creates the folder `release\CashG`, which contains the app, a copy of Node and the test guide. Zip that folder and upload it to Google Drive. Testers need nothing installed.

## Work on it

| Command | Where | What it does |
|---|---|---|
| `node app/server.js` | project root | Starts the server |
| `npm run dev` | `web` | Live-reloading interface (needs the server running too) |
| `npm run build` | `web` | Writes the finished interface to `app/public` |
| `node --test app/server.test.js` | project root | Tests the ticket rules and API |
| `npm test` | `web` | Tests the tracker logic |
| `node scripts/e2e.mjs` | project root | Drives the real interface in Chrome (needs the server running). Add `--show` to watch it |
| `node scripts/screenshots.mjs` | project root | Saves every screen to `docs/screenshots` (needs the server running) |

## Where things are

```
Start CashG.bat        one-click start
app/server.js          server, database tables and ticket rules
app/server.test.js     tests for the above
app/config.json        optional Microsoft Clarity project ID
app/data/cashg.db      the database (created on first run)
web/src/styles.css     design tokens and components
web/src/lib.js         tracker logic and formatting
web/src/pages/         screens
web/src/demoData.js    sample wallet data and the design notes
docs/                  01 planning, 02 test kit, 03 GCash research, 04 laws applied,
                       05 implementation, 06 evaluation, 07 recommendations, test guide, screenshots
scripts/package.ps1    builds the folder for testers
scripts/e2e.mjs        interface test
scripts/screenshots.mjs  screenshot capture
```

## The rule to know

Which ticket stage may follow which is defined once, as `TRANSITIONS` near the top of `app/server.js`. The interface reads it from the server, so changing that map changes the buttons and the tracker together. Run the tests after any change.

## Reset

Open the Support console and choose **Reset demo data**, or delete the `app/data` folder while the app is stopped.

## Configuration

`app/config.json` holds one optional setting, `clarityProjectId`. When it is set, the app shows a notice and only starts recording after the tester agrees. There are no secrets in this project.

## Known limitations

- No login: one preset customer, and the Support console is an open link.
- One-click start is Windows only.
- Changes made in the Support console appear in the customer app when a screen is opened or the browser tab regains focus.
- Node's built-in SQLite is a release candidate.
