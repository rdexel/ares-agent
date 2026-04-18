# Deal Reviewer Cold Sequence

**Status:** Live
**Owner:** Raleigh
**Last refresh:** 2026-04-08 (Run 2 of cold outreach)

---

## Hypothesis

VPs, Senior Associates, and Principals reviewing models feel the rework and variance pain. A deal-specific cold email focused on audit-ready, formula-linked output will convert — they're senior enough to value quality traceability, not just speed.

## Targeting

- **HubSpot list:** Deal Reviewer - IB/PE (List ID `15`, dynamic, ~260 members)
- **Filter IN:** VPs (investment team), Senior Associates, Principals
- **Filter OUT:** VP Finance, VP Accounting, VP Operations, Chief of Staff, IR, Marketing, Legal.
- **Exclude:** Contacts already enrolled in any sequence, or in any other pipeline-facing segment.

## Mechanics

- **Sequence ID:** `558893799`
- **Sender:** `raleigh@socratics.ai` (alias `tim.ceo@socratics.io`, userId `161977243`)
- **Personalization tokens:** same 7 custom properties as the Analyst sequence.
- **Runbook:** [operations/cold-outreach.md](../operations/cold-outreach.md)

## What we measure

- Reply rate (positive + neutral)
- Meetings booked
- Senior-level conversion vs. Analyst baseline (does "audit-ready" language land harder here?)

## Current performance

_Run 1 (2026-03-26, 3 companies / 9 contacts) + Run 2 (2026-04-08, included in combined pull). No reply-rate number logged in-workspace._

## Lessons so far

Same core lessons as the Analyst sequence (apply across all three cold sequences):

- Opener must lead with product value.
- "At Socratics.ai, we..." in body is mandatory.
- Deal names always paired with type descriptor.
- Group by email domain, not associatedcompanyid.
- No sign-off on cold touch #1.

Reviewer-specific:

- Reviewers are closer to the model-quality pain than analysts. The "formula-linked, fully traceable, every assumption visible" phrasing resonates more here than the pure-speed pitch.
- Press releases rarely name VPs on deal teams — deal-to-person attribution is harder for this segment. Default to firm-level hooks more often.

## Open questions

- Does a Reviewer-specific opener (emphasizing traceability/auditability) outperform the Analyst-style speed opener? Test when we have a comparable sample.
- Is there a third touch where we should pivot to a case study / proof point ("200+ IB and PE teams use us to skip the rebuild")?
