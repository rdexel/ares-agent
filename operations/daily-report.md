# Daily GTM Report Runbook

Produce an honest, actionable daily report. Pull data from HubSpot (deals, tasks, contacts, email engagements) and Gmail (both inboxes). Synthesize into a blunt assessment.

**Tone:** Direct. No cheerful fluff. Flag what's broken, stalling, or being ignored. Celebrate wins only when real. Output tells Raleigh exactly what to do today.

Reference: [../reference/hubspot.md](../reference/hubspot.md) for IDs and stages.

---

## Workflow

### Step 1 — Active deals snapshot

```
POST /crm/v3/objects/deals/search
{
  "filterGroups": [{
    "filters": [{"propertyName": "hs_is_closed", "operator": "EQ", "value": "false"}]
  }],
  "properties": ["dealname","dealstage","amount","closedate","hs_lastmodifieddate","pipeline","hubspot_owner_id","notes_last_updated","hs_deal_stage_probability"],
  "sorts": [{"propertyName": "closedate", "direction": "ASCENDING"}],
  "limit": 100
}
```

Classify each:
- **Overdue** — closedate in the past, still open
- **Closing this week** — within 7 days
- **Stale** — hs_lastmodifieddate > 7 days ago
- **Active** — modified in last 7 days, closedate future

Pull associated contacts for top deals (batch).

### Step 2 — Open tasks

```
POST /crm/v3/objects/tasks/search
filters: hs_task_status EQ NOT_STARTED
properties: hs_task_subject, hs_task_body, hs_task_status, hs_task_priority, hs_timestamp, hs_task_type, hubspot_owner_id
```

Flag overdue, due-today, and high-priority.

### Step 3 — Recent email replies in HubSpot (last 48h)

```
POST /crm/v3/objects/emails/search
filters: hs_email_direction EQ INCOMING_EMAIL AND hs_timestamp GTE <48h_ago>
properties: hs_email_subject, hs_email_sender_email, hs_email_text, hs_timestamp, hs_email_direction, hs_email_status
limit: 50
```

### Step 4 — Gmail check (both inboxes)

Use `mcp__gmail__search_emails`:

**raleigh@socratics.ai:**
```
query: "is:unread OR (is:inbox newer_than:1d)"
account: "raleigh"
max_results: 30
```

**tim@socratics.ai:** same query, `account: "tim"`.

Categorize:
- **Needs reply** — prospect/contact, no reply sent
- **FYI** — newsletters, notifications, internal
- **Potential lead** — inbound interest, demo requests, referrals

Ignore HubSpot notifications, marketing automation alerts.

### Step 5 — Sequence health + going cold

**Enrolled contacts:**
```
POST /crm/v3/objects/contacts/search
filters: hs_sequences_is_enrolled EQ true
properties: firstname, lastname, email, associatedcompanyid, hs_sequences_is_enrolled, hs_email_last_open_date, hs_email_last_reply_date, hs_email_last_send_date, lifecyclestage, hs_lead_status
limit: 100
```

**Going cold (opportunity stage + no activity 7+ days):**
```
POST /crm/v3/objects/contacts/search
filters: lifecyclestage EQ opportunity AND hs_lastmodifieddate LTE <7_days_ago>
limit: 50
```

### Step 6 — Company enrichment

Batch read names:
```
POST /crm/v3/objects/companies/batch/read
properties: name, domain
```

---

## Output

```markdown
# Daily GTM Report — [Today's Date]

---

## The Honest Take

[2–4 sentences. Are we making progress or treading water? What's the single most important thing to do today?]

---

## Inbox — Needs Action

| From | Subject | Account | Received | Why It Matters |
|------|---------|---------|----------|----------------|

(If nothing: "Both inboxes are clear. No prospect emails waiting on a reply.")

---

## Deals — Pipeline Status

### Active Pipeline
| Deal | Stage | Close Date | Last Activity | Status |

### Deals Needing Attention
- **[Deal]** — [specific problem + what to do]

---

## Tasks — Today's Punch List

### Overdue
### Due Today
### Coming Up (Next 3 Days)

---

## Sequence Health

- **Enrolled:** X
- **Engaged:** X
- **Silent:** X (list if <10)

(If mostly silent, say so bluntly.)

---

## Going Cold

| Contact | Company | Last Activity | Days Silent |

(If none: "No opportunities going cold. Good.")

---

## Today's Top 5

1. **[Action]** — [why, in one line]
2. **[Action]** — [why]
3. **[Action]** — [why]
4. **[Action]** — [why]
5. **[Action]** — [why]
```

---

## API budget

~10 HubSpot calls + 2 Gmail calls per run.

## Cleanup

`rm -f /tmp/hs_daily_*.json`

## Error handling

| Error | Action |
|-------|--------|
| Gmail MCP unavailable for one account | Report what you have, note which inbox couldn't be checked |
| No open deals | Flag it ("Pipeline is empty.") |
| API rate limit | Report partial results, note what's missing |
