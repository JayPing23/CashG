# What we learned about GCash, and what CashG changes

This is desk research from published sources, gathered on 17 November 2026. It is **not** a hands-on audit of the current GCash app. Before presenting, the group should confirm each "GCash today" row against the app on a group member's phone and add its own screenshots.

## How GCash is laid out (from sources)

| Area | What the sources say | Source |
|---|---|---|
| Home services | Home shows 11 services (Send, Load, Transfer, Bills, Borrow, GSave, GInsure, GInvest, GLife, A+ Rewards, GForest) plus View All | Soriano and Mamac, 2026 |
| Full service list | View All opens 42 functions in seven clusters | Soriano and Mamac, 2026 |
| Balance | The balance sits on a blue area at the top of the dashboard with a Cash In button beside it | ManilaShaker, 2022 redesign |
| Bottom bar | Home, Inbox, Pay QR, Activity, Profile | ManilaShaker; Z.com guide |
| Look | Brighter blues and a rounded typeface (Gotham Rounded) since the 2022 redesign | Brandi-Han |
| Reaction to redesign | Mixed: some users preferred the old home screen, others found the new one easier | Brandi-Han |
| Getting help | Help is at the bottom of the Home screen, or under Profile → Help → Get Help → Talk to Gigi | GCash official replies on X |
| Filing a ticket | Tickets are filed by chatting with the Gigi chatbot and typing "I want to submit a ticket" | GCash official replies on X |
| Checking a ticket | In the app under Profile → Help → Your Conversations, or by asking Gigi; updates also arrive by email | GCash on X; Tech Pilipinas |

## What users complain about (from review sites)

Review sites collect mostly unhappy users, so these are recurring themes, not measured rates.

- Being stuck with the chatbot and finding it hard to reach a person.
- Filing a ticket and hearing nothing afterwards.
- Slow or unhelpful support in general.

These themes are the reason our project focuses on ticket submission and tracking.

## What CashG keeps, and what it changes

| GCash today (per sources) | CashG | Principle |
|---|---|---|
| Blue top area with balance and Cash In | Kept | Jakob's Law: do not move what people already know |
| Icon grid of services on Home | Kept, as the same 4-column grid | Jakob's Law, recognition over recall |
| 11 services plus View All on Home | 7 plus View all | Hick's Law |
| 42 functions in seven clusters, several under product names (GSave, GInvest, GInsure) | Grouped by what the user wants to do, in plain words (Savings, Invest, Insurance), with search | Match between system and real world; Gestalt proximity |
| Raised QR button in the centre of the bottom bar | Kept | Jakob's Law, Fitts's Law |
| Help at the bottom of Home or inside Profile | Help has its own place in the bottom bar; Inbox moves to the bell on Home | Visibility; help and documentation |
| Tickets filed through a chatbot conversation | A three-step form: category, details, review | Progressive disclosure; error prevention; user control |
| Ticket status under Profile → Help → Your Conversations, plus email | Live stage on Home, a badge on Help, and a parcel-style tracker with the time of every stage | Visibility of system status; Jakob's Law |
| No stated signal when support is waiting on the customer (not found in sources) | "Action needed" mark, banner on the ticket, and the ticket returns to support when the customer replies | Von Restorff effect; feedback |
| Not found in sources: how a ticket's outcome is shown | "How this was resolved" note pinned on the ticket | Closure (Shneiderman) |
| Light theme (dark theme not confirmed in sources) | Light, dark and match-device | User control and freedom; accessibility |

## Limits of this research

- Sources disagree in places. One 2025 guide says ticket submission was removed in favour of the chatbot only, while GCash's own replies still describe submitting tickets through Gigi.
- The layout sources range from 2022 to 2026; the app changes often. An October 2026 store listing mentions "a fresh new look" that we have not seen described in detail.
- We could not load a rounded typeface like GCash's, so CashG uses Manrope. This is the largest remaining visual difference.
- CashG uses its own name, logo and icons, and is not affiliated with GCash.

## Sources

- Soriano, C. R. and Mamac, M. (2026), "From SMS-based remittance toolkit to super-app: Platformed finance and the case of GCash": https://journals.sagepub.com/doi/10.1177/29768624261425416
- ManilaShaker, "GCash App Gets a Makeover": https://manilashaker.com/gcash-app-gets-a-makeover/
- Brandi-Han, "GCash New App Design Being Tested, with Mixed Reviews": https://brandihan.com/gcash-tests-new-app-design/
- Z.com, "Everything You Need To Know About GCash": https://web.z.com/us/blogs/2295
- GCash official account on X, how to submit a ticket: https://x.com/gcashofficial/status/1656469326264938496
- GCash official account on X, how to check ticket status: https://x.com/gcashofficial/status/1890653292532744636
- GCash official account on X, Profile → Help → Talk to Gigi: https://x.com/gcashofficial/status/2057592744848101459
- Tech Pilipinas, "How to Contact GCash Hotline and Customer Service": https://techpilipinas.com/gcash-hotline-customer-service/
- Trustpilot, GCash reviews: https://www.trustpilot.com/review/www.gcash.com
- Unstar, "Is GCash Legit and Safe? What Reviews Say (2026)": https://unstar.app/blog/is-gcash-legit-safe-e-wallet-app-reviews-2026
- Ilonggo Tech Blog, GCash official support channels (2026): https://www.ilonggotechblog.com/2026/09/gcash-customer-support-will-always-be-free-beware-of-fake-social-media-support-and-unauthorized-fixers-schemes.html
