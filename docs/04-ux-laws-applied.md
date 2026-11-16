# UX laws, heuristics and research applied in CashG

Every row names something that exists in the built app, so each can be shown live. The "Evidence" column says where the guidance comes from. Items we chose not to apply, and why, are listed at the end.

## Laws of UX

| Law | What it says | Where it is in CashG |
|---|---|---|
| Jakob's Law | People expect your app to work like the ones they already use | GCash's blue balance area, Cash in button, icon grid and raised QR button are kept; the ticket tracker borrows the parcel-delivery pattern |
| Hick's Law | More choices mean slower decisions | Home shows 7 services plus View all (GCash shows 11 plus View All); six ticket categories; support sees only valid next steps |
| Fitts's Law | Big, close targets are faster to hit | Full-width primary buttons; 44 px minimum targets; QR under the thumb at the centre of the bar |
| Miller's Law | People hold only a few items in mind at once | Reference numbers and mobile numbers are shown in short groups; forms are split into three steps |
| Tesler's Law | Some complexity cannot be removed, only moved; the system should carry it | "Report a problem" on a receipt opens the ticket form with the subject and transaction details already filled in |
| Postel's Law | Accept input liberally, output it consistently | The mobile number is accepted with spaces, dashes or +63 and tidied into one format; amounts ignore stray characters |
| Doherty Threshold | Respond within about 400 ms to keep people engaged | Pressed states on every control; loading placeholders keep the layout; buttons show a busy state while sending |
| Goal-Gradient Effect | Motivation rises as the goal gets closer | Progress bar and "Step 2 of 3" on the ticket form and Send flow; the Home ticket card shows how far the ticket has travelled |
| Zeigarnik Effect | Unfinished tasks stay on the mind | An unfinished ticket is saved as a draft and Help shows "Finish your ticket" |
| Peak-End Rule | An experience is judged by its high point and its ending | A clear success screen with the reference number; a resolved ticket ends with "How this was resolved" |
| Serial Position Effect | First and last items are remembered best | Home and Profile sit at the two ends of the bottom bar |
| Von Restorff Effect | The item that differs is the one remembered | Only the current tracker stage is ringed; only tickets that need the customer are amber |
| Aesthetic-Usability Effect | Attractive designs are perceived as easier to use | One blue, one type family, consistent radius and spacing, light and dark themes |
| Law of Proximity / Common Region | Things close together or inside one boundary read as a group | Services grouped by purpose; activity grouped by day; each ticket is one card |
| Law of Continuity / Uniform Connectedness | Connected elements read as one path | One line runs through all tracker stages |
| Law of Prägnanz | People read the simplest form | One icon style, plain shapes, no decoration |
| Progressive Disclosure | Show only what is needed now | Three-step forms; demo services open a short sheet; design notes are off until asked for |

## Nielsen's 10 usability heuristics

| # | Heuristic | Where it is in CashG |
|---|---|---|
| 1 | Visibility of system status | Tracker with recorded times; ticket stage on Home; badge on Help; confirmations after every action |
| 2 | Match between system and the real world | Categories and services named in everyday words; stages named as a person would say them |
| 3 | User control and freedom | Back keeps what was typed; drafts; Edit links on review; theme choice; hide balance |
| 4 | Consistency and standards | The same rows, buttons, pills and sheets on every screen |
| 5 | Error prevention | Review step before sending; amount cannot exceed balance; Close and Reset ask first |
| 6 | Recognition rather than recall | Reference number always shown with a copy button; services listed by name; recent contacts |
| 7 | Flexibility and efficiency of use | Search and filters on tickets and services; quick amounts; pre-filled reports |
| 8 | Aesthetic and minimalist design | Each screen answers one question; colour is kept for meaning |
| 9 | Help users recognize, diagnose and recover from errors | Messages say what to change, under the field; focus jumps to the first problem; Try again on failures |
| 10 | Help and documentation | Help in the main bar; common questions beside ticket entry; a hint per ticket category |

## Norman's principles and Shneiderman's rules

| Principle | Where it is in CashG |
|---|---|
| Affordances and signifiers | Buttons look pressable; rows that open something end in a chevron; icons always carry a label |
| Feedback | Every tap changes something visible; toasts confirm; the tracker updates after support acts |
| Constraints | Invalid stage changes are never offered; required notes cannot be skipped |
| Mapping | The tracker runs top to bottom in time order; steps on forms run left to right |
| Conceptual model | A ticket is a parcel: it has a number, stops along a route, and a delivery |
| Strive for consistency; offer informative feedback; design dialogs to yield closure; prevent errors; permit easy reversal; keep users in control; reduce short-term memory load | Covered by the rows above; reversal is offered through Back, Edit, drafts and Reopen |

## Accessibility (WCAG 2.2 AA as the target)

| Practice | Where it is in CashG |
|---|---|
| Not colour alone | Every stage is an icon and a word |
| Keyboard and focus | Visible focus ring; skip link; focus moves to the screen title; sheets trap focus natively |
| Forms | Visible labels above fields; errors tied to their field and announced |
| Motion and transparency | Animations stop for "reduce motion"; frosted bars turn solid for "reduce transparency" |
| Target size | 44 px minimum on touch controls |

## Research the decisions rest on

| Finding | Source | What we did |
|---|---|---|
| A status tracker the user checks works best with updates pushed to them | NN/g, "Status Trackers" | Tracker plus badge, Inbox entry and Home card |
| Visibility of system status is among the most important usability principles | NN/g, "Visibility of System Status" | Made it the centre of the ticket experience |
| On mobile, labels belong above the field; inline labels disappear when typing starts | Baymard Institute | All labels sit above their fields; no placeholder-only labels |
| Single-column forms cause fewer skipped fields and errors than multi-column ones | Baymard Institute (2023) | Every form is one column |
| Glass effects help show depth but hurt contrast when used on text over changing content | NN/g, "Glassmorphism" | Frosted effect on the bottom bar and sheet backdrop only |
| A redesigned e-wallet scored better than an existing one with 35 Filipino senior citizens on design, navigation, efficiency and language | AHFE 2024 conference paper | Plain language, labelled icons, larger targets (we have not read the full paper) |

## The frosted look: tried, then partly kept

The design tool we used recommended a frosted-glass style. We applied it, looked at screenshots in both themes, and kept it only where it helps:

- **Kept:** the bottom bar and a light blur behind open sheets. Here it signals that content continues underneath.
- **Replaced:** the sticky page header. It was frosted in the trial, but a solid blue bar with a white title matches what GCash users know, so familiarity won.
- **Removed:** the design-notes panel. Blue shapes showed through paragraphs of text and made them harder to read.
- **Never applied:** cards, forms and the tracker, where text must stay at full contrast.

## Not applied, and why

- **Estimated resolution times.** A promise the system cannot keep would break trust; the tracker shows only what has happened.
- **Parkinson's Law (time limits).** Nothing in a support flow benefits from a countdown.
- **Occam's Razor** as a separate item: it is the reason for the removals above, not a feature.
- **A rounded typeface like GCash's.** We could not add a new font, so CashG uses Manrope.

## Sources

- Laws of UX: https://lawsofux.com/
- NN/g, Status Trackers: https://www.nngroup.com/videos/status-trackers/
- NN/g, Visibility of System Status: https://www.nngroup.com/articles/visibility-system-status/
- NN/g, Glassmorphism: https://www.nngroup.com/articles/glassmorphism/
- Baymard, Mobile Form Usability: Label Position: https://baymard.com/blog/mobile-form-usability-label-position
- Baymard, Avoid Inline Labels on Mobile: https://baymard.com/blog/mobile-forms-avoid-inline-labels
- Baymard, Avoid Multi-Column Forms: https://baymard.com/blog/avoid-multi-column-forms
- AHFE 2024, e-wallet design for senior citizens in the Philippines: https://openaccess.cms-conferences.org/publications/book/978-1-964867-32-8/article/978-1-964867-32-8_45
- Axess Lab, Glassmorphism Meets Accessibility: https://axesslab.com/?p=5111
