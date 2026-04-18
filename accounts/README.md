# Accounts — Layer 2

The living record of who we're talking to. **One canonical file per account.** This is where texture lives that HubSpot can't hold — the why, the read between the lines, the "Tim should call this one personally."

HubSpot remains the source of truth for structured fields (stage, owner, last activity). These files hold the human context around those fields.

## The test

A new teammate reading any file here should know, within a minute:
1. Where we stand with this account
2. What the next step is (and who owns it)
3. Why the account matters
4. What's been tried and what worked / didn't

If they can't, the file needs work.

---

## Active accounts

| Account | Stage | Next step | Last touch |
|---------|-------|-----------|------------|
| [Class VI Pathfinder](class-vi.md) | Trial | Send platform access + book follow-up (overdue) | 2026-04-17 (15-min call) |
| [Turtleback Partners](turtleback-partners.md) | Trial / design partnership | Send trial agreement + NDA | 2026-04-18 (James responded, scheduling next week) |

## Snapshot index (deal stages from last monitor run)

These came from the contact-monitor state as of 2026-04-02. Use as a reference list — canonical files should exist for any account that's actively in motion.

| Account | Stage |
|---------|-------|
| Enertech Capital | appointmentscheduled |
| Forbes Partners | appointmentscheduled |
| Class VI | Initial Demo (3380746945) |
| Union Square Advisors | Demo Interest |
| Cade Partners | Initial Demo |
| Gapstone Group | Demo Interest |
| Stifel | Demo Interest |
| CSIS | Demo Interest |
| FT Partners | Demo Interest |
| Ivy Capital Partners | Demo Interest |
| Bay Advisory | appointmentscheduled |
| Lempriere Wells | appointmentscheduled |
| iMerge Advisors | appointmentscheduled |
| Lark Street Capital | closedlost |
| Fluential Partner | closedlost |
| Turtleback Partners | appointmentscheduled |

_Closed-lost accounts should be moved to [../archive/](../archive/) once the lesson is extracted. Don't let dead deals clutter active memory._

---

## How to create an account file

1. Copy [_template.md](_template.md) to `accounts/<slug>.md` (lowercase, hyphens).
2. Fill in what you know now. Leave blanks explicit rather than fabricating.
3. Cross-link to any campaign(s) they're enrolled in.
4. Update this README's active table.

## When an account dies

Move the file to `archive/accounts/<slug>.md`, extract one line to [playbooks/lessons.md](../playbooks/lessons.md) if the loss taught us something, and remove from the active table above.
