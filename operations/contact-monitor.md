# Contact Monitor Runbook

Scan HubSpot for high-priority contact and deal activity since the last run. Produce a P0/P1/P2 priority report.

Designed to be run manually before GTM meetings. Target: 6–8 API calls per run.

Reference: [../reference/hubspot.md](../reference/hubspot.md).

---

## Inputs

| Input | Description |
|-------|-------------|
| `lookback_hours` | How far back to scan (default: 24) |

---

## State file

`../state/contact-monitor.json`

```json
{
  "last_run": "2026-04-02T12:00:00Z",
  "known_deal_stages": { "<dealId_or_name>": "<stage>" },
  "flagged_contact_ids": []
}
```

- First run: create with current timestamp.
- Subsequent: use `last_run` as lookback (unless `lookback_hours` overrides).
- After each run: update `last_run` and `known_deal_stages`.
- `flagged_contact_ids` resets each run (dedup within a single report).

---

## Workflow

### Step 1 — Recently modified contacts

```
POST /crm/v3/objects/contacts/search
filters: hs_lastmodifieddate GTE <lookback_ms>
properties: firstname, lastname, email, jobtitle, associatedcompanyid,
            lifecyclestage, hs_lead_status,
            hs_email_last_reply_date, hs_email_last_open_date,
            hs_sequences_is_enrolled, notes_last_updated, hs_lastmodifieddate
limit: 100, sort: hs_lastmodifieddate DESC
```

### Step 2 — Recently modified deals

```
POST /crm/v3/objects/deals/search
filters: hs_lastmodifieddate GTE <lookback_ms>
properties: dealname, dealstage, amount, closedate, hs_lastmodifieddate, hs_is_closed
limit: 50, sort: hs_lastmodifieddate DESC
```

Compare each deal's current `dealstage` against `known_deal_stages` in state to detect stage movement.

### Step 3 — New email replies

```
POST /crm/v3/objects/emails/search
filters: hs_email_direction EQ INCOMING_EMAIL AND hs_timestamp GTE <lookback_ms>
properties: hs_email_subject, hs_email_sender_email, hs_email_text, hs_timestamp, hs_email_direction
limit: 50, sort: hs_timestamp DESC
```

### Step 4 — New meetings booked

```
POST /crm/v3/objects/meetings/search
filters: hs_createdate GTE <lookback_ms>
properties: hs_meeting_title, hs_meeting_start_time, hs_meeting_end_time, hs_createdate
limit: 20, sort: hs_createdate DESC
```

### Step 5 — Stale opportunities

Opportunity stage + no activity 7+ days:

```
POST /crm/v3/objects/contacts/search
filters: lifecyclestage EQ opportunity AND hs_lastmodifieddate LTE <7_days_ago_ms>
limit: 50
```

### Step 6 — Enrich with company names

Batch read all unique `associatedcompanyid`s from Steps 1–5.

### Step 7 — Classify and report

| Tier | Signal |
|------|--------|
| **P0 — Act Now** | Incoming email reply |
| **P0 — Act Now** | New meeting booked |
| **P0 — Act Now** | Deal stage advanced |
| **P1 — Follow Up** | Lifecycle stage changed |
| **P1 — Follow Up** | Contact opened email 2+ times recently |
| **P1 — Follow Up** | Deal close date within 7 days |
| **P2 — Watch** | Opportunity cold (no activity 7+ days) |
| **P2 — Watch** | Deal moved backward or closed lost |

### Step 8 — Output

```
## P0 — Act Now

**[Contact]** ([Company]) — Replied to email
  Subject: "RE: ..."
  Received: [timestamp]
  Preview: "..."

**[Company]** — Deal moved: [old stage] → [new stage]
  Deal: [name]
  Close date: [date]

---

## P1 — Follow Up

**[Contact]** ([Company]) — Opened email 3x in last 24h
...

---

## P2 — Watch

**[Contact]** ([Company]) — No activity in 12 days
...

---

## Summary
- P0: X requiring immediate action
- P1: X to follow up on
- P2: X to watch
- Contacts scanned: X modified in last [N]h
- Deals scanned: X modified in last [N]h
```

### Step 9 — Update state

Write updated state to `../state/contact-monitor.json`:
- `last_run` = current time
- `known_deal_stages` = current stages
- `flagged_contact_ids` = []

### Step 10 — Cleanup

`rm -f /tmp/hs_monitor_*.json`

---

## API budget

| Step | Calls |
|------|-------|
| Modified contacts | 1 |
| Modified deals | 1 |
| Incoming emails | 1 |
| New meetings | 1 |
| Stale opportunities | 1 |
| Company enrichment | 1 |
| **Total** | **6** |
