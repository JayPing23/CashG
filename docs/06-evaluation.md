# Design evaluation

**No participants have tested CashG yet.** This chapter contains the checks that have been run so far (automated checks and a designer's own review) and leaves clearly marked space for the group's usability test results. Do not present the designer review as user research.

## 1. Automated checks (run 17 November 2026)

| Check | Result |
|---|---|
| Colour contrast, 21 text and background pairs, light and dark | All pass WCAG AA; lowest is white on the dark-theme blue at 4.65:1 |
| Rendered pages (12 screens): one `h1`, `main` and `nav` landmarks, skip link, every field labelled, every button and link named | Pass on all 12 |
| Keyboard: focus lands on the screen title, Tab reaches the form's button, focus ring visible | Pass on the New ticket form |
| Reduced motion and reduced transparency settings | Handled in the stylesheet; not observed on a real device |
| Static source scan (a11y-audit scanner) | Reported missing labels, `h1`, `main` and skip link per file. These are false positives: the elements come from shared components, and the rendered-page check above confirms they are present |

Not yet run: a screen reader (NVDA or TalkBack), Accessibility Insights FastPass, 200% text zoom, and a full keyboard pass through every screen.

## 2. Designer review against the critique framework

This is the builder's own review of the screenshots. It is opinion informed by the principles in `04-ux-laws-applied.md`, not evidence.

**Overall impression.** The app now reads as GCash at a glance, and the ticket tracker is the clearest screen in it. The biggest remaining gap is that the demo screens are thinner than the ticket screens.

**Usability**

| Finding | Severity | Recommendation |
|---|---|---|
| Changes made by support appear only when the customer's screen is reopened or refocused | Moderate | Add live updates |
| The raised QR button covers a strip of the list behind it on phones | Minor | Add bottom padding to lists equal to the button's overhang |
| Demo services end in a sheet, which may disappoint a tester who expects a flow | Minor | Say "demonstration" on the tile, or build one more full flow |
| The Support console is reached from Profile on phones, which a tester may not find without the guide | Minor (by design) | Keep it in the test guide; a real product would separate the two apps |
| On touch screens a tapped row can stay highlighted | Minor | Apply hover styles only on devices that hover |

**Visual hierarchy.** On Home the eye goes to the balance first, then Cash in, then the service grid, which is the intended order. On a ticket, the stage name in the title and the ringed "Now" step are found first.

**Consistency.** One blue, one type family, one radius scale and one row pattern are used throughout. The Support console is deliberately plainer than the customer app.

**What works well**

- The tracker shows real times and never shows a time for a stage that has not happened.
- "Action needed" is the only amber element in a ticket list, so it is found immediately.
- A problem can be reported from a receipt with the details already filled in.
- Every status is an icon and a word, so nothing depends on colour.

**Priority recommendations**

1. Run the usability test in section 3 and fix what participants struggle with before polishing further.
2. Run a screen reader through the ticket journey.
3. Add live updates so the tracker changes without a refresh.

## 3. Usability test results (to be filled in by the group)

Materials are in `02-usability-test-kit.md`.

| Measure | Result |
|---|---|
| Number of participants | |
| Task completion rate | |
| Average time to submit a ticket | |
| Participants who explained the ticket stage correctly | |
| Average SUS score | |
| Most common problem | |

## 4. Microsoft Clarity observations (to be filled in by the group)

| What to look for | What you saw |
|---|---|
| Dead clicks (taps on things that do nothing) | |
| Rage clicks | |
| Where people scrolled back or hesitated | |
| Where sessions ended | |

## 5. Accessibility Insights FastPass (to be filled in by the group)

| Screen | Theme | Automated failures | Tab-stop problems |
|---|---|---|---|
| | | | |

## 6. Motion review (designer's check against Emil Kowalski's guidelines)

| Guideline | CashG | Verdict |
|---|---|---|
| Buttons give press feedback | Scale to 0.97 on press, 140 ms | Meets |
| Interface animations stay under 300 ms | Sheets 280 ms, dialogs 220 ms, screen change 240 ms | Meets |
| Things enter with ease-out, never ease-in | One strong ease-out curve everywhere | Meets |
| Nothing appears from scale 0 | Dialogs start at 0.96, toasts at 0.96 | Meets |
| Stagger delays 30–80 ms | Tracker steps 60 ms apart | Meets |
| Reduced motion respected | Movement switched off; changes still happen | Meets |
| Hover effects only on devices that hover | Not done | Open issue |
