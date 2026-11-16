# Usability test kit

Materials for the group to run its own tests. **No results are recorded here yet.** Fill in the tables only with what real participants did and said.

## 1. Before each session

- Run **Reset demo data** in the Support console so every participant starts from the same four demo tickets.
- Tell the participant: we are testing the design, not you; there are no wrong answers; please think aloud.
- If Microsoft Clarity is switched on, the app shows a notice before recording starts. Make sure the participant reads it.

## 2. Tasks and what counts as success

| # | Task given to participant | Success means |
|---|---|---|
| 1 | Find where to get help with a problem | Reaches the Help screen |
| 2 | Send a ticket about a bill charged twice | Sees the "We have your ticket" screen |
| 3 | Find the ticket's reference number | Reads or copies the `TKT-` number |
| 4 | Find the ticket again from Home | Opens the ticket's page |
| 5 | Say what stage the ticket is at | Names the stage marked "Now" |
| 6 | (as support) Find the ticket and acknowledge it | Status becomes "Received" |
| 7 | (as support) Ask the customer for information | Status becomes "Waiting for customer" |
| 8 | (as customer) Notice that support needs a reply | Finds the "Action needed" ticket unprompted |
| 9 | (as customer) Reply | Ticket returns to "In progress" |
| 10 | (as support) Resolve; (as customer) read the resolution | Reads the "How this was resolved" note |

## 3. Observation sheet (one per participant)

Participant code: ______  Device: ______  Date: ______

| Task | Completed? (yes / with help / no) | Time (seconds) | Errors or wrong turns | What they said |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |

Status comprehension check, asked after task 5: *"In your own words, what is happening with your ticket right now, and what happens next?"*

Answer: ______________________________________________

## 4. System Usability Scale (SUS)

The standard ten statements. Each is rated from 1 (strongly disagree) to 5 (strongly agree). Replace "this system" with "CashG" if you prefer.

1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

**Scoring, per participant**

- Odd-numbered statements: rating minus 1.
- Even-numbered statements: 5 minus rating.
- Add the ten results and multiply by 2.5. The score runs from 0 to 100.
- Report the average across participants and the number of participants. A score of 68 is commonly cited as average.

## 5. Short follow-up questions

- What was the easiest part?
- Where did you hesitate or get lost?
- Did the ticket tracker tell you what you wanted to know? What was missing?
- Compared with support in an e-wallet you use, what is better or worse here?

## 6. Results summary (fill in after testing)

| Measure | Result |
|---|---|
| Number of participants | |
| Task completion rate (tasks completed ÷ tasks attempted) | |
| Average time, task 2 (submit a ticket) | |
| Participants who explained the ticket stage correctly | |
| Average SUS score | |
| Most common problem | |

## 7. Tool checks

**Microsoft Clarity** (heatmaps and session recordings)

1. Create a free project at clarity.microsoft.com.
2. Copy the project ID (a short code in Settings → Overview).
3. Put it in `app/config.json` as `"clarityProjectId": "yourcode"`, then run `scripts\package.ps1` again.
4. Testers need internet for recordings to reach your dashboard.
5. Record what you observed: dead clicks, rage clicks, where people scrolled back, where they left.

Not yet verified by us: whether Clarity records a copy running on `localhost`. Check your dashboard after your own first test run before sending the zip to classmates.

**Accessibility Insights for Web** (free Microsoft browser extension)

Run **FastPass** on Home, New ticket, a ticket page and the Support console, in both light and dark theme. Record the number of failures per screen and what each was.

| Screen | Theme | Automated failures | Tab-stop problems |
|---|---|---|---|
| | | | |
