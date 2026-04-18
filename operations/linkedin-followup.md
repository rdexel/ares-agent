# LinkedIn Follow-Up Runbook

Pull open LinkedIn tasks from HubSpot, retrieve the original cold-email context for each contact, and draft warm follow-up messages in Tim's voice.

**Before running:** read [../playbooks/linkedin-voice.md](../playbooks/linkedin-voice.md) and [../playbooks/email-voice.md](../playbooks/email-voice.md). See the campaign hypothesis in [../campaigns/linkedin-warm-followup.md](../campaigns/linkedin-warm-followup.md).

---

## Inputs

| Input | Description |
|-------|-------------|
| `owner_email` | HubSpot owner (default: `timeun@gmail.com`) |
| `limit` | Max tasks to process (default: all open LinkedIn tasks) |

Reference IDs: [../reference/hubspot.md](../reference/hubspot.md).

---

## Workflow

### Step 1 — Pull open LinkedIn tasks

```
POST /crm/v3/objects/tasks/search
{
  "filterGroups": [{
    "filters": [
      { "propertyName": "hubspot_owner_id",   "operator": "EQ", "value": "<owner_id>" },
      { "propertyName": "hs_task_status",     "operator": "EQ", "value": "NOT_STARTED" },
      { "propertyName": "hs_task_type",       "operator": "EQ", "value": "LINKED_IN" }
    ]
  }],
  "properties": ["hs_task_subject","hs_task_body","hs_task_status","hs_task_priority","hs_timestamp","hs_task_type"],
  "sorts": [{"propertyName": "hs_timestamp", "direction": "ASCENDING"}],
  "limit": 100
}
```

Zero tasks → report and stop.

### Step 2 — Get associated contacts

```
GET /crm/v3/objects/tasks/<taskId>/associations/contacts
```

Associations often empty — fall back to parsing contact name from task subject (patterns in [task-pull.md](task-pull.md)).

For contacts found, batch-read details and company details.

### Step 3 — Get original email context

Goal: find the personalization token the contact saw in Raleigh's email, so the LinkedIn message reuses the same hook.

**Option A — search email engagements by contact:**
```
GET /crm/v3/objects/contacts/<contactId>/associations/emails
```
Fetch most recent outbound (`hs_email_direction: FORWARDED_EMAIL`):
```
GET /crm/v3/objects/emails/<emailId>?properties=hs_email_subject,hs_email_text,hs_email_direction,hs_timestamp
```

**Option B — check task body** for context.

**Option C — fall back to research** per [../playbooks/research.md](../playbooks/research.md) (abbreviated: 1 web search + 1 news page fetch).

Extract:
- Deal name / personalization token from subject
- Company name from body
- Hook type (deal attribution / firm-level / problem-led)

### Step 4 — Sanity check out-of-ICP contacts

Before drafting, flag obvious out-of-ICP contacts for removal instead of messaging. (Lesson: 2026-04-16 batch included Xage — cybersecurity, not PE/IB.)

### Step 5 — Check for account-level overlap

If multiple contacts at the same firm are in the batch, flag for coordination. Don't triple-touch the same firm on the same day. Recommend staggering or consolidating.

### Step 6 — Draft messages

Follow [../playbooks/linkedin-voice.md](../playbooks/linkedin-voice.md).

Choose format:

| Scenario | Format |
|----------|--------|
| Not yet connected (default) | Connection request (<300 chars) |
| Already connected | Direct message (<600 chars, target <400) |
| Multiple prior touches, cold | Re-engagement (<400 chars) |

### Step 7 — Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK: [Task Subject]
DUE: [Due Date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTACT: [First Last] — [Title] at [Company]
LINKEDIN: [URL or "not on file"]
MESSAGE TYPE: [Connection / DM / Re-engagement]
ORIGINAL EMAIL SUBJECT: [subject or "not found"]
DEAL HOOK: [token carried over]

---MESSAGE START---
[Ready-to-paste message]
---MESSAGE END---

Character count: [X] / [limit]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

End with a summary:

```
## Summary
- Total LinkedIn tasks: X
- Messages drafted: X
- Skipped (no contact info / out of ICP): X
- Connection requests: X
- Direct messages: X
- Re-engagements: X
- Account-level conflicts flagged: X
```

### Step 8 — Cleanup

`rm -f /tmp/hs_linkedin_*.json`

---

## Error handling

| Error | Action |
|-------|--------|
| No owner found | Stop |
| No LinkedIn tasks | Report and stop |
| No contact on task | Note in output, skip |
| No LinkedIn URL | Still draft; note "LinkedIn URL not on file" |
| API error | Report clearly, don't guess |
