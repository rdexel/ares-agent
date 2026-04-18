# Deal Analyst Cold Sequence

**Status:** Live
**Owner:** Raleigh
**Last refresh:** 2026-04-08 (Run 2 of cold outreach)

---

## Hypothesis

Analysts at PE/IB firms are closest to the intake-layer pain (messy data, manual rebuilds, model rework). A personalized, deal-specific cold email with the "10-minute institutional model" framing will convert at higher rates than a generic speed-of-work pitch.

## Targeting

- **HubSpot list:** Deal Analyst - IB/PE (List ID `14`, dynamic, ~530 members)
- **Filter IN:** Analysts, Associates, Senior Associates
- **Filter OUT:** Non-deal roles (IR, marketing, compliance, HR, finance/accounting, EAs, chief of staff, operations). See [playbooks/research.md](../playbooks/research.md).
- **Exclude:** Contacts already enrolled in any sequence, or in any other pipeline-facing segment.

## Mechanics

- **Sequence ID:** `558893796`
- **Sender:** `raleigh@socratics.ai` (alias `tim.ceo@socratics.io`, userId `161977243`)
- **Personalization tokens:** `socratics_email_subject`, `socratics_email_opener`, `socratics_email_body`, `socratics_email_cta`, `socratics_deal_hook`, `socratics_deal_type`, `socratics_company_team`
- **Enrollment endpoint:** `POST /automation/sequences/2026-03/enrollments?userId=161977243`
- **Daily cap:** 1,000 enrollments per inbox
- **Runbook:** [operations/cold-outreach.md](../operations/cold-outreach.md)

## What we measure

- Reply rate (positive + neutral)
- Meetings booked
- Opens → reply conversion (weakest link signal)
- Companies that generate multi-contact interest (account-level signal)

## Current performance

_No explicit metrics captured yet in this workspace. Pull from HubSpot "Replied" list (ID `58`) and sequence dashboard. TODO: log a baseline snapshot after next run._

## Lessons so far

From cold-outreach Run 2 (2026-04-08, 9 analyst contacts across 3 firms):

- **Opener must lead with product value**, not a question about the prospect's work. "Curious how..." and "How long did..." earn nothing.
- **Always say "At Socratics.ai, we..."** in the body — names the company and flows naturally into the pitch.
- **Always pair deal names with a descriptor** ("the Spartaco acquisition," not just "Spartaco"). Bare names mean nothing to the reader.
- **Group contacts by email domain**, not `associatedcompanyid` — HubSpot associations were wrong in multiple cases.
- **No sign-off** on cold touch #1. Signature handles it; "Best," looks template-y.
- **CTA must name the company team** — specific, not generic ("Happy to show the [Company] team how it works").

Full extracted lessons live in [playbooks/lessons.md](../playbooks/lessons.md).

## Open questions

- What's the actual reply rate for this segment vs. reviewers and IC buyers? Need to snapshot after next run.
- Do we see domain-level clustering of replies (one firm pops, rest silent)? That would say "account-based" > "role-based."
