# Operations — Runbooks

How to execute recurring GTM motions. Each runbook covers the **mechanics** — what API calls to make, what order, how to output. Voice and pattern guidance lives in [../playbooks/](../playbooks/).

| Runbook | When to use |
|---------|-------------|
| [cold-outreach.md](cold-outreach.md) | Pull a segment, research, draft, enroll in sequence |
| [linkedin-followup.md](linkedin-followup.md) | Draft Tim's LinkedIn follow-ups for opened-but-no-reply contacts |
| [daily-report.md](daily-report.md) | Blunt daily GTM report — pipeline, inbox, tasks, going cold |
| [contact-monitor.md](contact-monitor.md) | Scan HubSpot for priority changes (P0/P1/P2 report) |
| [task-pull.md](task-pull.md) | Export open tasks to TSV for Google Sheets |
| [meeting-briefs.md](meeting-briefs.md) | Generate pre-meeting briefs for the week's demos |
| [replied-followups.md](replied-followups.md) | Find gaps in follow-ups on the Replied segment |

## How runbooks relate to the four layers

- **Accounts:** Runbooks touch many accounts; individual account context lives in [../accounts/](../accounts/).
- **Campaigns:** Most runbooks serve a campaign. Know which campaign before running.
- **Playbooks:** When a runbook says "write in Raleigh's voice," it's delegating to [../playbooks/email-voice.md](../playbooks/email-voice.md).
- **Reference:** IDs and API details live in [../reference/](../reference/), not repeated here.

## Implementation rules (apply across all runbooks)

- `curl` for all HubSpot API calls. Not Python urllib (macOS SSL issue).
- Write curl responses to `/tmp/hs_*.json` temp files, process in Python.
- Never embed raw API JSON in shell variables.
- Delete temp files when done (`rm -f /tmp/hs_*.json`).
- Batch endpoints count as 1 API call — prefer them.
- Rate limit: 110 requests per 10 seconds (Search endpoint exempt).
