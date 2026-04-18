# Tim LinkedIn Warm Follow-Up

**Status:** Live
**Owner:** Tim (sender) / Raleigh (ops, drafts)
**Last refresh:** 2026-04-16 (TSV output of drafted follow-ups)

---

## Hypothesis

Contacts who opened Raleigh's cold email but didn't reply are warm, not uninterested. When Tim (CEO) reaches out personally on LinkedIn, reuses the same deal hook from the original email, and asks assumptively for a demo, a meaningful share converts to booked calls.

The CEO-weight signal matters: prospect got an email from GTM, now the founder is reaching out personally. Signals they're prioritized, not a name on a list.

## Targeting

- Contacts in HubSpot with:
  - An open LinkedIn task assigned to Tim (owner `161538153`)
  - Task type `LINKED_IN`
  - Status `NOT_STARTED`
- Drawn from prospects who already opened a cold email but haven't replied or booked.

## Mechanics

- Three message formats:

  | Scenario | Format | Char limit |
  |----------|--------|-----------|
  | Not yet connected | Connection request | 300 (target <250) |
  | Already connected | Direct message | 600 (soft) |
  | Multiple prior touches, cold | Re-engagement | 400 (soft) |

- **Default:** Connection request.
- **Sender:** Tim's personal LinkedIn (manual send — Ares drafts, Tim sends).
- **Continuity:** Every message must reuse the same deal/firm hook the contact saw in the cold email. Pull the original email from HubSpot engagement history, or fall back to task-body context, or research.
- **Runbook:** [operations/linkedin-followup.md](../operations/linkedin-followup.md)
- **Voice:** [playbooks/linkedin-voice.md](../playbooks/linkedin-voice.md)

## What we measure

- Connection accept rate (are prospects seeing the intro favorably?)
- LinkedIn → demo conversion (the real KPI)
- Which segments respond most (decision-maker vs junior buyer)

## Current performance

Drafts from 2026-04-16 batch (see [archive/output-linkedin-followups-2026-04-16.tsv](../archive/output-linkedin-followups-2026-04-16.tsv)):

- **19 drafted messages** across PE/IB VPs, Associates, MDs, IB Analysts.
- **1 mis-filed contact flagged for removal** (Richard Savage / Xage — cybersecurity, not PE/IB). TODO: remove from sequence.
- **Account-level overlap** flagged: multiple Crestview contacts (3) and multiple Salem / Stride firm entries — don't triple-touch the same firm.

## Lessons so far

- Tim's intro and the pitch should be **one motion**, not two stiff sentences. "I'm Tim, CEO at Socratics. We build audit-ready financial models..." beats "I'm Tim Eun, CEO of Socratics.ai. I wanted to reach out about..."
- Never reference email tracking ("I saw you opened my email"). Reference the topic, not the signal.
- **Account-level coordination matters.** When multiple contacts at the same firm get LinkedIn messages, either stagger them or consolidate — triple-touching a firm is worse than a single well-placed ask.
- Wrong-list leakage is real (Xage cybersecurity contact in a PE/IB segment). Add a sanity-check step in the LinkedIn runbook to flag out-of-ICP contacts before drafting.

## Open questions

- Should this campaign skip LinkedIn entirely for contacts the email has already reached 2+ times? Or is the CEO-weight enough to justify the touch regardless?
- For accepted connections that still don't reply after 7 days, what's the re-engagement cadence? Currently ad-hoc.
