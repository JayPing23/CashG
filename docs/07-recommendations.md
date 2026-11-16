# Recommendations and future improvements

Ordered by how much each would improve the experience for the effort involved.

## Before presenting

1. **Run the usability test** with classmates and record real results in `06-evaluation.md`. This is the one thing the project cannot claim without doing.
2. **Confirm the GCash comparison on a real phone.** `03-gcash-research.md` is built from published sources; check each "GCash today" row against the current app and add your own screenshots.
3. **Try `Start CashG.bat` on a groupmate's laptop** from a downloaded copy, to see the Windows warning your testers will see.
4. **Run a screen reader** (NVDA is free) through submitting and tracking a ticket.

## Next improvements to the design

| Improvement | Why | Principle |
|---|---|---|
| Live updates on the tracker | Today a change appears only after the screen is reopened | Visibility of system status |
| "Was this resolved?" on a resolved ticket, with a one-tap reopen request | Lets the customer end the journey, not only support | User control; closure |
| Attach a screenshot to a ticket | Most e-wallet problems are easier to show than describe | Tesler's Law |
| Full demo flows for Cash in, Bills and Load | They currently end in a short sheet | Consistency |
| A rounded typeface | The largest remaining visual difference from GCash | Jakob's Law |
| Hover styles only on devices that hover | A tapped row can stay highlighted on phones | Feedback |
| Tagalog and Taglish wording | Many GCash users are more comfortable in Filipino | Match with the real world |
| Larger-text and simpler-layout mode | Published research with Filipino seniors points to language and navigation as barriers | Accessibility |

## Next improvements to the system

| Improvement | Why |
|---|---|
| Login with customer and staff roles | The current build has one customer and an open Support console |
| Ticket assignment and internal notes | Needed once more than one agent works the queue |
| A hosted copy | Lets testers on phones and Macs take part without a download |
| Push or SMS notifications | The "push" half of status visibility, beyond the in-app badge |

## What we would not add

- **Estimated resolution times**, unless they come from real data. A missed estimate damages trust more than no estimate.
- **A chatbot in front of the ticket form.** Reviews of GCash support repeatedly describe being stuck with one.
