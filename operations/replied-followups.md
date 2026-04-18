# Replied Follow-Ups Runbook

Pull contacts from the "Replied" segment in HubSpot, analyze follow-up gaps, and print a prioritized action report.

**Script:** [../scripts/replied-followups.js](../scripts/replied-followups.js)

---

## Run

```bash
HUBSPOT_ACCESS_TOKEN=<token> node scripts/replied-followups.js
```

**Env var required:**
- `HUBSPOT_ACCESS_TOKEN`

Configurable thresholds at the top of the script:
- `STALE_REPLY_DAYS` (default 7) — replied this long ago without follow-up = urgent
- `COLD_CONTACT_DAYS` (default 14) — not contacted this long = going cold
- `INTERNAL_DOMAINS` — domains to filter out (e.g., `socratics.ai`)

---

## What it outputs

Prioritized buckets:

| Tier | Criteria |
|------|----------|
| **Urgent** | Replied 7+ days ago, no follow-up sent |
| **High** | Last contact 14+ days ago, going cold |
| **On Track** | Recent contact, follow-up in motion |
| **In Sequence** | Already enrolled — skip manual touch |

## When to run

- Monday mornings (catch weekend replies)
- After major outreach sends (catch conversions early)
- Ad-hoc when Raleigh asks "who replied and what's the status"

## After the run

- Treat the **Urgent** tier as today's action list.
- Flag any **account-level conflict** (multiple contacts at the same firm) — coordinate, don't send uncoordinated follow-ups. See the LinkedIn follow-up campaign lessons ([../campaigns/linkedin-warm-followup.md](../campaigns/linkedin-warm-followup.md)).
- If a new pattern surfaces in the gaps, log it to [../playbooks/lessons.md](../playbooks/lessons.md).

## Related

- [../reference/hubspot.md](../reference/hubspot.md) — the Replied list is ID `58`
- [../playbooks/email-voice.md](../playbooks/email-voice.md) — voice for the follow-up drafts
