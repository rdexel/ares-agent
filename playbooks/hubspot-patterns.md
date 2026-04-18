# HubSpot Patterns

Things that have bitten us more than once, and the patterns that work. Not exhaustive API documentation — see [reference/hubspot.md](../reference/hubspot.md) for that.

---

## The macOS SSL gotcha

**Use `curl` for HubSpot API calls. Not Python `urllib`.**

Python's default urllib has SSL issues on macOS that fail intermittently on HubSpot's TLS handshake. curl handles it cleanly. If you need to manipulate the response, pipe curl output to Python or write the response to a temp file and `json.load` it.

**Why this matters:** A 100-contact run that half-fails with SSL errors midway through is worse than a run that's slightly less elegant.

---

## Never embed API JSON in shell

HubSpot responses contain HTML, newlines, quotes, and special characters that break shell interpolation. Passing a raw API response through a bash variable or heredoc will corrupt the JSON.

**Do:**
```bash
curl -s https://api.hubapi.com/... -o /tmp/hs_<step>.json
python3 -c "import json; data = json.load(open('/tmp/hs_<step>.json'))"
```

**Don't:**
```bash
RESPONSE=$(curl -s https://api.hubapi.com/...)
python3 -c "data = '''$RESPONSE'''"  # breaks
```

Write to temp files. Clean up with `rm -f /tmp/hs_*.json` when done.

---

## Group contacts by email domain, not associatedcompanyid

**HubSpot's company-contact associations are unreliable.** In Run 2 of cold outreach (2026-04-08) we saw:
- Sageview profiles attached to Crestview company records
- Clearview contacts attached to Altamont

Email domain is reliable. If two contacts share `@clearviewcap.com`, they work at Clearview — regardless of what `associatedcompanyid` says.

**Exception:** For batch properties reads, `associatedcompanyid` is fine to pull as a secondary signal. Just don't use it as the primary grouping key.

---

## Filter by title BEFORE research

Every web fetch costs time. Don't spend it on non-deal roles.

Run role filtering on the raw contact list immediately after the batch read — before the research step. See [research.md](research.md) for the filter criteria.

---

## Batch endpoints count as one call

HubSpot rate limit: 110 requests per 10 seconds. A `POST /contacts/batch/read` for 100 contacts counts as **one** call, not 100. Always prefer batch endpoints over per-record GETs.

The `/crm/v3/objects/contacts/search` endpoint is exempt from the 10-second limit entirely.

---

## Paginate lists from the start

Deal Analyst, Deal Reviewer, and IC Buyer lists all have 250+ members. Do not assume a single page is enough. Paginate `GET /crm/v3/lists/<listId>/memberships?after=<cursor>` until the cursor is empty.

---

## Always check sequence enrollment before adding to outreach

Before pulling contacts into a new cold campaign, filter out anyone with:
- `hs_sequences_is_enrolled` = true
- `hs_sequences_actively_enrolled_count` > 0

Also filter contacts that already have a `hs_lead_status` (they're being worked). Double-enrolling contacts is worse than under-reaching.

**Why:** First Deal Reviewer pull didn't check this and pulled contacts already in an active sequence. Fixed forward, but flagged in feedback memory.

---

## Tasks are often not linked to contacts

HubSpot tasks in this workspace frequently have no contact associations. When they're missing, parse contact + company names from the task subject. Common patterns:

- "Follow up with [Name] from [Company]"
- "Follow up: Follow up with [Name] from [Company]"
- "Schedule with [Name]"
- "Call [Name]"
- "Reschedule with [Name]"

Known contact-company mappings live in [operations/task-pull.md](../operations/task-pull.md) — keep that list current when new contacts appear.

---

## Known-good properties sets

**For cold outreach pulls:**
```
firstname, lastname, email, jobtitle, hs_linkedin_url,
associatedcompanyid, lifecyclestage, hs_lead_status,
hs_sequences_is_enrolled, hs_sequences_actively_enrolled_count
```

**For contact monitoring:**
```
firstname, lastname, email, jobtitle, associatedcompanyid,
lifecyclestage, hs_lead_status,
hs_email_last_reply_date, hs_email_last_open_date,
hs_sequences_is_enrolled, notes_last_updated,
hs_lastmodifieddate
```

**For sequence-health (daily report):**
```
firstname, lastname, email, associatedcompanyid,
hs_sequences_is_enrolled, hs_email_last_open_date,
hs_email_last_reply_date, hs_email_last_send_date,
lifecyclestage, hs_lead_status
```

---

## Custom properties reserved for sequence personalization

Seven custom contact properties power cold-sequence templates. They're written once per contact per run.

| Property | Purpose |
|----------|---------|
| `socratics_deal_hook` | Deal name + descriptor ("the Spartaco acquisition") |
| `socratics_deal_type` | Deal type (acquisition, sale, exit, investment, etc.) |
| `socratics_email_subject` | Subject line for email 1 |
| `socratics_email_opener` | Opening sentence for email 1 |
| `socratics_email_body` | Body paragraph for email 1 |
| `socratics_email_cta` | CTA with company team name |
| `socratics_company_team` | Company team name ("the CenterGate team") |

Follow-up emails in the sequence use `{{contact.socratics_deal_hook}}` and `{{contact.socratics_company_team}}` for continuity across touches.
