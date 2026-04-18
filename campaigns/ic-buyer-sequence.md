# IC Buyer Cold Sequence

**Status:** Live
**Owner:** Raleigh
**Last refresh:** 2026-04-08 (Run 2 of cold outreach)

---

## Hypothesis

Investment-committee buyers — MDs, Partners, Managing Partners — make the adoption call. They won't respond to a junior-pitch tone. A bold capability claim tied to a specific deal they're proud of, in founder-to-founder register, converts here.

## Targeting

- **HubSpot list:** IC Buyer - PE/IB (List ID `16`, dynamic, ~672 members)
- **Filter IN:** Directors, Managing Directors, Partners, Managing Partners, Founders.
- **Filter OUT:** CFO, CTO, COO (unless they're investment-committee members), legal, administrative, non-deal operations.
- **Exclude:** Already enrolled, already in pipeline elsewhere.

## Mechanics

- **Sequence ID:** `559020782`
- **Sender:** `raleigh@socratics.ai` (alias `tim.ceo@socratics.io`, userId `161977243`)
- **Personalization tokens:** same 7 custom properties as the other cold sequences.
- **Runbook:** [operations/cold-outreach.md](../operations/cold-outreach.md)

## What we measure

- Reply rate from senior-level contacts (expected to be lower than Analyst, but higher value per reply)
- Meetings booked → senior meetings tend to shortcut the cycle
- Whether IC-level replies pull the rest of the deal team into conversations

## Current performance

_No explicit metrics logged. Sequence runs the same personalization structure as Analyst/Reviewer. TODO: separate reply-rate snapshot for senior segment after next run._

## Lessons so far

All core cold-outreach lessons apply. IC-specific nuances:

- Tone is more direct. "I'm the founder of Socratics.ai" or "I run Socratics.ai" (Tim's voice on LinkedIn, carried over) works better than "At Socratics.ai, we build..." on first touch to senior buyers.
- Use a data point they're proud of when available (e.g., "10x topline growth at MSI Express during the hold") and pivot immediately to product value — don't dwell on the compliment.
- Keep to 4–5 sentences for senior buyers. They're reading on mobile. They want to skim and decide.

## Open questions

- Do senior buyers convert better on founder-to-founder register ("I'm the founder of Socratics.ai") vs. team register ("At Socratics.ai, we build...")? Worth a structured test.
- Is there a separate follow-up track when a senior contact opens but doesn't reply? Potentially flow into [Tim LinkedIn warm follow-up](linkedin-warm-followup.md).
