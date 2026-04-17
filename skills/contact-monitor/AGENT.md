# AGENT.md — Contact Monitor

You are an agent that scans HubSpot for high-priority contact and deal activity
and produces a concise priority report. Designed to be run manually before GTM meetings.

---

## Authentication

```
Authorization: Bearer $HUBSPOT_API_KEY
```

Use curl for all API calls. Write API responses to temp files (`/tmp/hs_monitor_*.json`)
and process in Python. **Delete all temp files when done.**

---

## Inputs

| Input | Description |
|---|---|
| `lookback_hours` | How far back to scan for changes (default: 24) |

---

## State File

The agent uses a lightweight state file to track what's already been flagged:

```
skills/contact-monitor/state.json
```

Structure:
```json
{
  "last_run": "2026-04-02T12:00:00Z",
  "known_deal_stages": { "<dealId>": "<stage>" },
  "flagged_contact_ids": ["<id1>", "<id2>"]
}
```

- On first run, create the state file with current timestamp
- On subsequent runs, use `last_run` as the lookback point (override with `lookback_hours` if provided)
- After each run, update `last_run` to current time
- `flagged_contact_ids` resets each run — it's only to deduplicate within a single report

---

## Workflow

### Step 1 — Recently Modified Contacts (1 API call)

Search for contacts modified since lookback:

```
POST https://api.hubapi.com/crm/v3/objects/contacts/search
{
  "filterGroups": [{
    "filters": [{
      "propertyName": "hs_lastmodifieddate",
      "operator": "GTE",
      "value": "<lookback_timestamp_ms>"
    }]
  }],
  "properties": [
    "firstname", "lastname", "email", "jobtitle", "associatedcompanyid",
    "lifecyclestage", "hs_lead_status",
    "hs_email_last_reply_date", "hs_email_last_open_date",
    "hs_sequences_is_enrolled", "notes_last_updated",
    "hs_lastmodifieddate"
  ],
  "sorts": [{"propertyName": "hs_lastmodifieddate", "direction": "DESCENDING"}],
  "limit": 100
}
```

### Step 2 — Recently Modified Deals (1 API call)

```
POST https://api.hubapi.com/crm/v3/objects/deals/search
{
  "filterGroups": [{
    "filters": [{
      "propertyName": "hs_lastmodifieddate",
      "operator": "GTE",
      "value": "<lookback_timestamp_ms>"
    }]
  }],
  "properties": [
    "dealname", "dealstage", "amount", "closedate",
    "hs_lastmodifieddate", "hs_is_closed"
  ],
  "sorts": [{"propertyName": "hs_lastmodifieddate", "direction": "DESCENDING"}],
  "limit": 50
}
```

Compare each deal's current `dealstage` against `known_deal_stages` in state.json
to detect stage movement.

### Step 3 — New Email Replies (1 API call)

```
POST https://api.hubapi.com/crm/v3/objects/emails/search
{
  "filterGroups": [{
    "filters": [
      {
        "propertyName": "hs_email_direction",
        "operator": "EQ",
        "value": "INCOMING_EMAIL"
      },
      {
        "propertyName": "hs_timestamp",
        "operator": "GTE",
        "value": "<lookback_timestamp_ms>"
      }
    ]
  }],
  "properties": [
    "hs_email_subject", "hs_email_sender_email", "hs_email_text",
    "hs_timestamp", "hs_email_direction"
  ],
  "sorts": [{"propertyName": "hs_timestamp", "direction": "DESCENDING"}],
  "limit": 50
}
```

### Step 4 — New Meetings Booked (1 API call)

```
POST https://api.hubapi.com/crm/v3/objects/meetings/search
{
  "filterGroups": [{
    "filters": [{
      "propertyName": "hs_createdate",
      "operator": "GTE",
      "value": "<lookback_timestamp_ms>"
    }]
  }],
  "properties": [
    "hs_meeting_title", "hs_meeting_start_time", "hs_meeting_end_time",
    "hs_createdate"
  ],
  "sorts": [{"propertyName": "hs_createdate", "direction": "DESCENDING"}],
  "limit": 20
}
```

### Step 5 — Stale Opportunities Check (1 API call)

Find contacts at opportunity stage with no activity in 7+ days:

```
POST https://api.hubapi.com/crm/v3/objects/contacts/search
{
  "filterGroups": [{
    "filters": [
      {
        "propertyName": "lifecyclestage",
        "operator": "EQ",
        "value": "opportunity"
      },
      {
        "propertyName": "hs_lastmodifieddate",
        "operator": "LTE",
        "value": "<7_days_ago_timestamp_ms>"
      }
    ]
  }],
  "properties": [
    "firstname", "lastname", "email", "associatedcompanyid",
    "hs_lastmodifieddate", "lifecyclestage"
  ],
  "limit": 50
}
```

### Step 6 — Enrich with Company Names (1 API call)

Collect all unique `associatedcompanyid` values from Steps 1-5. Batch read:

```
POST https://api.hubapi.com/crm/v3/objects/companies/batch/read
{
  "inputs": [{"id": "<id1>"}, {"id": "<id2>"}, ...],
  "properties": ["name"]
}
```

### Step 7 — Classify and Report

Classify every signal into a priority tier:

| Tier | Signal | Description |
|---|---|---|
| **P0 — Act Now** | Incoming email reply | Someone responded — needs reply |
| **P0 — Act Now** | New meeting booked | Confirm prep needed |
| **P0 — Act Now** | Deal stage advanced | Momentum — don't let it stall |
| **P1 — Follow Up** | Contact lifecycle stage changed | Lead → opportunity or similar |
| **P1 — Follow Up** | Contact opened email 2+ times recently | Interest signal |
| **P1 — Follow Up** | Deal close date within 7 days | Approaching deadline |
| **P2 — Watch** | Opportunity went cold (no activity 7+ days) | Risk of losing them |
| **P2 — Watch** | Deal stage moved backward or closed lost | Needs attention |

### Step 8 — Output

Present a clean report grouped by priority tier:

```
## P0 — Act Now

**[Contact Name]** ([Company]) — Replied to email
  Subject: "RE: Your Socratics.ai access"
  Received: 4/2/2026 2:30 PM
  Preview: "Thanks Tim, we'd love to set up a call..."

**[Company]** — Deal moved: Demo Scheduled → Initial Demo
  Deal: [Deal Name]
  Close date: 4/11/2026

---

## P1 — Follow Up

**[Contact Name]** ([Company]) — Opened email 3x in last 24h
  Last open: 4/2/2026 11:00 AM

**[Deal Name]** — Close date in 5 days
  Stage: Demo Interest | Close: 4/7/2026

---

## P2 — Watch

**[Contact Name]** ([Company]) — No activity in 12 days
  Stage: Opportunity | Last modified: 3/21/2026

---

## Summary
- P0: X items requiring immediate action
- P1: X items to follow up on
- P2: X items to watch
- Contacts scanned: X modified in last 24h
- Deals scanned: X modified in last 24h
```

### Step 9 — Update State

Write updated state.json with:
- Current timestamp as `last_run`
- Current deal stages as `known_deal_stages`
- Clear `flagged_contact_ids`

### Step 10 — Cleanup

Delete all `/tmp/hs_monitor_*.json` files.

---

## Known IDs

**Pipeline stages:**
| ID | Name |
|---|---|
| 3394403052 | Demo Interest |
| appointmentscheduled | Demo Scheduled |
| 3380746945 | Initial Demo |
| 3381702384 | Second Demo |
| qualifiedtobuy | Trial/Testing |
| presentationscheduled | Presentation Scheduled |
| decisionmakerboughtin | Decision Maker Bought-In |
| contractsent | Contract Sent |
| closedwon | Closed Won |
| closedlost | Closed Lost |

**Owner IDs:**
| Email | ID | Name |
|---|---|---|
| timeun@gmail.com | 161538153 | Tim Eun |

---

## API Budget

Target: **6-8 API calls per run**

| Step | Calls |
|---|---|
| Modified contacts | 1 |
| Modified deals | 1 |
| Incoming emails | 1 |
| New meetings | 1 |
| Stale opportunities | 1 |
| Company name enrichment | 1 |
| **Total** | **6** |
