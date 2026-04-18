# Meeting Briefs Runbook

Generate pre-meeting briefs for the week's demo meetings. Node script fetches demo meetings from HubSpot, scrapes company websites, pulls attendee backgrounds, runs everything through Claude for analysis, and exports each brief as a `.docx`.

**Script:** [../scripts/meeting-briefs.js](../scripts/meeting-briefs.js)

---

## Run

```bash
HUBSPOT_ACCESS_TOKEN=<token> ANTHROPIC_API_KEY=<key> node scripts/meeting-briefs.js
```

**Env vars required:**
- `HUBSPOT_ACCESS_TOKEN` — HubSpot private app token
- `ANTHROPIC_API_KEY` — for the Claude analysis step

**Output:** `.docx` files written to `scripts/briefs/`.

---

## When to run

- Start of each week, ahead of the demo schedule
- Before any client call where a written prep is needed
- After new demos land on the calendar (ad-hoc)

## After the run

- Open each brief and spot-check for obvious misses (wrong attribution, wrong sector, generic output).
- Port anything important into the relevant [../accounts/](../accounts/) file — especially a reusable deal hook or a buyer-specific concern worth remembering.
- If Claude's analysis is persistently shallow, the prompt inside the script may need tuning. Check the `askClaude` call and the system prompts.
- If the script errors on auth, `HUBSPOT_ACCESS_TOKEN` is the usual suspect — tokens expire and need rotation.

## Related

- [daily-report.md](daily-report.md) — for calendar-level awareness of what's upcoming
- [../playbooks/research.md](../playbooks/research.md) — the research standards the brief should meet
