# CashG — Phase 1 Planning Report

Final version, 17 November 2026. Research activities described here are **planned, not conducted**, unless a section says otherwise. Personas and journey emotions are assumptions to be checked against real participants.

## 1. Project overview

CashG is a redesign concept for a GCash-inspired e-wallet, built as an academic demonstration for a university UI/UX course. The wallet screens are navigable design demonstrations with sample data. The support ticketing is real: a customer submits a concern, receives a reference number, and follows it on a parcel-delivery-style tracker that is drawn from what the support side actually does.

CashG is not affiliated with GCash. It uses its own name, logo, palette and icons.

## 2. Objectives

1. Let a customer submit a ticket and receive a reference number in one short guided flow.
2. Show at a glance where a ticket is, without contacting support.
3. Let the support side move a ticket through its lifecycle, with every change recorded.
4. Show how the wider wallet could be improved by applying UX laws and heuristics, with the reasoning visible in the app.
5. Run on a classmate's Windows laptop with no installation and no internet.
6. Give the group honest materials and tooling to evaluate it.

## 3. Requirements

**Functional**

- No sign-up or login. The app opens as one preset demo customer.
- Create a ticket: category, subject, description, optional transaction details, review, confirmation with reference.
- My tickets: list, search by reference or subject, filter by stage.
- Ticket page: tracker, activity, support messages, customer reply, resolution.
- Support console: queue with search and filter, stage changes, customer-visible messages, information requests, resolve with a note, close, reset demo data.
- A badge on tickets updated since the customer last opened them.
- Redesigned demo screens: Home, All services, Send money, Activity, Inbox, Profile and settings.
- Design notes on every screen, naming the principle applied.
- Light, dark and match-device themes.

**Nonfunctional**

- Responsive from a 360 px phone to a desktop monitor, with a layout made for each, not a scaled one.
- WCAG 2.2 AA as the target.
- Tickets survive refresh, closing the browser and restarting the app.
- Fully offline: fonts and icons are bundled.
- No MPIN, one-time code or financial credential is requested anywhere.

## 4. Target users

| | Customer | Support staff |
|---|---|---|
| Needs | Report a problem fast; know it was received; know what happens next | See what is new; understand a concern quickly; update with few clicks |
| Frustrations | Long forms, no confirmation, silence, a vague "pending" | Incomplete tickets, scattered context, repeat contacts |
| Goals | Concern resolved with little effort | Accurate, traceable handling |

Evaluators are classmates from other groups. Each has their own copy and plays both roles.

## 5. Preliminary personas (assumptions)

- **Mika, 21, student.** Daily e-wallet user on a mid-range Android phone. A cash in did not arrive. Wants proof her report was received and a clear sense of progress.
- **Tito Ben, 52, store owner.** Lower digital confidence, larger text. Needs plain language and one obvious next step.
- **Carla, 27, support agent.** Works on a laptop through many tickets per shift. Wants a scannable queue and one-step updates.

## 6. UX research framework

- **Objectives:** how people report e-wallet problems today, what they expect after submitting, how they read progress stages.
- **Participants:** classmates from other groups for evaluation; 5–8 e-wallet users for interviews if time allows.
- **Methods:** short interviews, a survey, task-based testing, the System Usability Scale, Microsoft Clarity recordings and heatmaps, an Accessibility Insights check.
- **Sample interview questions:** Tell me about the last time an e-wallet transaction went wrong. How did you know your report was received? What did you want to know while waiting?
- **Sample survey questions:** How often do you use an e-wallet? Have you submitted a support request before? "I knew the status of my request at all times" (1–5).
- **Outputs:** confirmed personas, pain points, task metrics, SUS score, Clarity observations, accessibility findings, prioritized fixes.

Materials are in `02-usability-test-kit.md`.

## 7–8. Journey and experience maps (assumptions)

**Customer**

| Stage | Likely emotion | Difficulty | Design response |
|---|---|---|---|
| Open app | Neutral or anxious | Finding help | Help in the main navigation; ticket stage on Home |
| Support center | Impatient | Too many choices | Six plain categories, common questions beside them |
| Choose category | Uncertain | Jargon | Each category has an example in everyday words |
| Fill form | Effortful | What to write | A hint per category; checks as each field is left |
| Review | Cautious | Fear of mistakes | Summary with an Edit link per item |
| Submit | Tense | Double-submit | Button locks and shows progress |
| Reference | Relief | Losing the number | Copy button; ticket saved in My tickets |
| Track | Anxious | "Pending" means nothing | Stage tracker with recorded times |
| Updates | Reassured or frustrated | Missing a request | Badge, "Action needed" mark, banner on the ticket |
| Resolution | Relief | Unclear outcome | "How this was resolved" pinned on the ticket |

**Support**

| Stage | Difficulty | Design response |
|---|---|---|
| Console | What needs attention | Counts per stage; a line stating how many are new |
| Queue | Scanning | Dense rows, filter chips, search |
| Open ticket | Scattered context | Concern and full history on one screen |
| Update | Invalid jumps | Only valid next steps are offered |
| Message | Unsure what the customer sees | Composer labelled "Visible to the customer"; a preview of the customer's tracker |
| Resolve, close | Vague or premature | A note is required; Close asks for confirmation |

## 9–10. Information architecture and sitemap

```
Customer (Home · Activity · Help · Inbox · Profile)
  /                        Home
  /services                All services (demo)
  /send                    Send money (demo flow)
  /activity                Activity (demo)
  /inbox                   Inbox (demo, plus real ticket updates)
  /profile                 Profile and settings
  /help                    Support center
  /help/new                New ticket (3 steps)
  /help/tickets            My tickets
  /help/tickets/:reference Ticket page and tracker
Support
  /support                 Ticket queue
  /support/:reference      Ticket management
```

## 11. User flows

- **Submit:** Help → category → details → review → submit → confirmation → Track this ticket.
- **Track:** badge → My tickets → ticket → tracker → (if asked for information) reply → back to In progress.
- **Support:** queue → ticket → Acknowledge → Start review → Start working → (Ask for information ↔ reply) → Resolve with note → Close.

## 12. Wireframe specifications

| Screen | Layout and interaction |
|---|---|
| Home | Balance card with show and hide; four main actions; recent activity; the customer's live ticket stage; a short services list. Two columns on desktop. |
| Support center | My tickets entry with counts; six categories with examples; common questions. |
| New ticket | Three steps with a progress bar; errors under each field; Back keeps what was typed. |
| My tickets | Search; filter chips with counts; rows with subject, reference, category, dates and a stage pill. |
| Ticket page | Stage as the title; reference with copy; tracker; action banner; resolution; concern; activity and reply. Two columns on desktop. |
| Tracker | Vertical list. Done: filled check and time. Current: ringed mark with "Now". Upcoming: hollow, no time. "Waiting for you" appears only when it happened. |
| Ticket queue | Counts per stage; search and chips; table on desktop, stacked rows on phones; reset demo data. |
| Support ticket | Concern and history on the left; next-step buttons and a preview of the customer's tracker on the right. |

Change from the earlier plan: the tracker stays vertical on every screen size. A vertical journey is the parcel-app convention people already know, and one layout is easier to learn than two.

## 13. UX laws and heuristics matrix

| Principle | Purpose | Implementation | Evaluation |
|---|---|---|---|
| Jakob's Law | Reuse the familiar | Wallet layout, bottom navigation, parcel-style tracker | First click: find Help |
| Hick's Law | Faster choices | Four main actions on Home; six categories; only valid next steps | Time to choose a category |
| Fitts's Law | Easy targets | Full-width primary buttons, 44 px minimum targets | Clarity dead clicks |
| Progressive disclosure | Lower load | Three-step ticket form and send flow | Form completion rate |
| Von Restorff effect | Highlight what matters | Only the current stage is ringed; only waiting tickets are amber | "What is the status?" in 5 seconds |
| Doherty Threshold | Feel responsive | Pressed states, loading placeholders, busy buttons | Clarity recordings, comments |
| Gestalt | Group and connect | One line through the tracker; services grouped by purpose; activity grouped by day | Comprehension question |
| Nielsen 1, visibility of status | Always know the state | Tracker, recorded times, confirmations, Home ticket card | Status comprehension rate |
| Nielsen 3 and 5 | Control, error prevention | Review steps, Back keeps data, confirm Close and Reset | Error count |
| Nielsen 6, recognition | No memorizing | Reference always visible and copyable; services listed by name | Task: locate your ticket |
| Nielsen 9, error recovery | Fixable errors | Messages say what to change; Try again on failures | Recovery without help |
| Nielsen 10, help | Self-service | Common questions beside ticket entry | FAQ use before submitting |
| Norman: feedback, constraints | Cause and effect | Invalid actions are not offered; notes required where they matter | Think-aloud notes |
| Shneiderman: closure | Flows end clearly | Confirmation screen; resolution note | SUS |
| Aesthetic–usability | Trust | One blue field, flat surfaces, one type family | SUS |

Not forced in: Miller's Law and Tesler's Law are covered by the rows above where they apply.

## 14. Accessibility strategy

- Semantic landmarks, one `h1` per screen, real buttons, links and labels.
- Stage is always an icon and a word together, never colour alone.
- The tracker is an ordered list; the current step is announced as the current step.
- Visible focus rings; a skip link; focus moves to the screen title on navigation.
- Errors are tied to their field and announced; confirmations are announced.
- Sheets use the browser's native dialog, so focus stays inside and Escape closes them.
- Text resizes; motion is switched off for people who ask their device for reduced motion.

## 15. Visual design system

- **Colour:** one brand blue (`#1d5fd6`), used as a single field on the balance card, on primary buttons and on the tracker. Neutral grounds and surfaces. Green, amber and red only for meaning, always with an icon. Dark theme uses true neutral darks, not navy.
- **Tokens:** every colour is named once with a light and a dark value in `web/src/styles.css`.
- **Type:** Manrope, bundled with the app. Sizes 12–14 for meta, 16 body, 20–28 titles, 34 for the balance. Tabular figures on all numbers.
- **Shape:** 20 px cards, 10 px inputs, pill buttons and chips. Borders separate surfaces; shadows only on things that float (sheets, toasts).
- **Motion:** screen transitions, the tracker drawing in step by step, press feedback, sheets and toasts.
- **Components:** button, icon button, field, search, chip, segmented control, switch, pill, row, card, notice, tracker, timeline bubble, sheet, toast, loading placeholder, empty state, error state.

## 16. Technology stack

| Layer | Choice | Why |
|---|---|---|
| Interface | React with Vite, plain JavaScript | Reusable components keep many screens consistent |
| Styling | Tailwind CSS plus a token stylesheet | Layout utilities; one source of truth for colour |
| Screens | React Router | Real addresses for every screen |
| Animation | Motion | Tracker and toast animation with reduced-motion support |
| Icons | Lucide | One consistent outline set |
| Server | One Node file, built-in modules only | Nothing to install |
| Database | SQLite, built into Node | One file; real SQL; works offline |
| Tests | Node's built-in test runner | Nothing to install |
| Delivery | Folder with `Start CashG.bat` and a bundled copy of Node | One double-click for testers |

Rejected: Supabase (needs internet and accounts), WAMP (every tester would install it), plain HTML/CSS/JS (possible, slower to keep consistent).

## 17. System architecture

```
Start CashG.bat
  └─ bundled node.exe runs app/server.js   (this computer only, offline)
       ├─ serves the built interface from app/public
       ├─ /api/...  ticket rules and validation
       └─ app/data/cashg.db  (SQLite)
Browser ── optional Microsoft Clarity script (needs internet, asks first)
```

All ticket rules live in the server, so the interface cannot skip a step.

## 18. Database design

| Table | Columns |
|---|---|
| `tickets` | `id` PK, `reference` unique, `category`, `subject`, `description`, `details`, `status`, `resolution_note`, `is_demo`, `created_at`, `updated_at`, `customer_seen_at` |
| `ticket_events` | `id` PK, `ticket_id` FK → tickets, `actor` (customer or support), `type` (status_change or message), `from_status`, `to_status`, `body`, `created_at` |
| `settings` | `key` PK, `value` |

- **Relationship:** one ticket has many events.
- **Reference:** `TKT-<year>-<6-digit counter>`.
- **Transitions:** `submitted → received → under_review → in_progress → resolved → closed`; `under_review` or `in_progress → waiting_for_customer → in_progress`; `resolved → in_progress` to reopen. Defined once, in `app/server.js`.
- **Tracker:** drawn only from `ticket_events`; every time shown is a recorded one.
- **Validation:** subject 5–100 characters, description 20–2000, details up to 300, category from six fixed options; checked in the form and again in the server.
- **Durability:** a ticket and its event are saved together or not at all.
- **Demo records:** four seeded tickets, flagged `is_demo` and labelled in the interface.

## 19. Authentication and authorization

None, by decision. There is one preset customer, and the Support console is an open link, because each tester owns both sides of their own copy. The server only accepts connections from the computer it runs on. This is a stated limitation; login with roles is future work.

## 20. Feature prioritization

- **Must:** ticket submission, reference, persistence, My tickets, ticket page, tracker, activity, support console, stage changes, customer-visible messages, one-click start, redesigned Home.
- **Should:** search, filters, information requests with reply, update badge, All services, Send money, Activity, Inbox, Profile, themes, design notes, reset demo data, Clarity hook.
- **Could (not built):** Cash in, Pay bills, Buy load and QR as full demo flows; attachments; assignment; charts; an online copy.
- **Won't:** login, real money, any GCash integration.

## 21. Development roadmap

| Stage | Work | Proof |
|---|---|---|
| 1 | Server, tables, ticket rules | Automated lifecycle tests pass |
| 2 | Design tokens and components | Screens render in both themes |
| 3 | Ticket flow, My tickets, ticket page, tracker | A support change appears on the customer tracker |
| 4 | Support console | Invalid stage jumps are refused |
| 5 | Redesigned wallet screens and design notes | Every control gives feedback |
| 6 | Responsive and accessibility pass | Screenshots at 360, 768, 1280 and 1920; keyboard run |
| 7 | One-click folder | Starts from a fresh extract |
| 8 | Test kit and documentation | Documents match the built system |

## 22. Testing and evaluation strategy

- **Automated:** lifecycle, reference uniqueness, transition rules, validation, persistence across restart, tracker logic.
- **In a browser:** every screen at four widths, both themes, keyboard only.
- **By the group:** Clarity, Accessibility Insights FastPass, task scripts, observation sheet, SUS.

## 23. Risks and limitations

- Windows may warn about the downloaded start script; the test guide shows the Unblock step. Managed school PCs may block it.
- One-click start is Windows only.
- Clarity needs internet on the tester's laptop; recording from a local copy is reported to work but is not yet confirmed by us.
- Node's SQLite module is labelled "release candidate"; the folder ships the exact Node version that was tested.
- No login, so no per-user privacy.
- Updates appear when a screen is opened or the browser tab regains focus, not instantly.
- The design notes describe what CashG does. They make no claims about the current GCash app, which the group has not formally audited.
