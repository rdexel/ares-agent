# AGENT.md — LinkedIn Warm Follow-Up Writer

You are an agent that pulls LinkedIn follow-up tasks from HubSpot and drafts
personalized LinkedIn messages for Tim Eun (CEO) to send from his personal
LinkedIn account.

**Context:** These contacts have already received cold emails from Raleigh and
opened them (confirmed by HubSpot tracking). They have NOT replied or booked a
meeting. The LinkedIn message is the next touchpoint in the sequence — Tim reaching
out personally to get the demo on the calendar.

**Before doing anything else, read these skill files:**
- `skills/linkedin-writer/linkedin-message-style.md` (LinkedIn-specific rules, tone, examples)
- `skills/email-writer/raleigh-email-style.md` (core voice and tone rules)
- `skills/email-writer/research-campaign.md` (research process for deal hooks)

---

## Authentication

```
Authorization: Bearer $HUBSPOT_API_KEY
```

Use curl for all API calls. Write responses to temp files and process in Python.
Delete all temp files when done.

---

## Inputs (User Provides at Start)

| Input | Description |
|---|---|
| `owner_email` | HubSpot owner email (default: timeun@gmail.com) |
| `limit` | Max tasks to process (default: all open LinkedIn tasks) |

---

## Workflow

### Step 1 — Pull Open LinkedIn Tasks

```
POST https://api.hubapi.com/crm/v3/objects/tasks/search
Content-Type: application/json

{
  "filterGroups": [{
    "filters": [
      {
        "propertyName": "hubspot_owner_id",
        "operator": "EQ",
        "value": "<owner_id>"
      },
      {
        "propertyName": "hs_task_status",
        "operator": "EQ",
        "value": "NOT_STARTED"
      },
      {
        "propertyName": "hs_task_type",
        "operator": "EQ",
        "value": "LINKED_IN"
      }
    ]
  }],
  "properties": [
    "hs_task_subject",
    "hs_task_body",
    "hs_task_status",
    "hs_task_priority",
    "hs_timestamp",
    "hs_task_type"
  ],
  "sorts": [{"propertyName": "hs_timestamp", "direction": "ASCENDING"}],
  "limit": 100
}
```

**Known owner IDs (skip lookup if match):**
| Email | Owner ID | Name |
|---|---|---|
| timeun@gmail.com | 161538153 | Tim Eun |

If zero LinkedIn tasks are found, report that and stop.

### Step 2 — Get Associated Contacts

For each task, fetch associated contacts:

```
GET https://api.hubapi.com/crm/v3/objects/tasks/<taskId>/associations/contacts
```

**If associations are empty**, parse the contact name from the task subject using
the same patterns as the task-pull agent (see `skills/task-pull/AGENT.md` for
known contact-company mappings).

For contacts found via associations, batch-read details:

```
POST https://api.hubapi.com/crm/v3/objects/contacts/batch/read
{
  "inputs": [{"id": "<contactId>"}],
  "properties": [
    "firstname", "lastname", "email", "jobtitle",
    "hs_linkedin_url", "associatedcompanyid",
    "lifecyclestage", "hs_lead_status"
  ]
}
```

Then batch-read company details:

```
POST https://api.hubapi.com/crm/v3/objects/companies/batch/read
{
  "inputs": [{"id": "<companyId>"}],
  "properties": ["name", "domain", "website", "industry", "description"]
}
```

### Step 3 — Get the Original Email Context

For each contact, retrieve the most recent outbound email sent to them. This gives
you the personalization token (deal name / company hook) that the contact already saw.

**Option A — Search email engagements by contact association:**
```
GET https://api.hubapi.com/crm/v3/objects/contacts/<contactId>/associations/emails
```
Then fetch the most recent outbound email:
```
GET https://api.hubapi.com/crm/v3/objects/emails/<emailId>?properties=hs_email_subject,hs_email_text,hs_email_direction,hs_timestamp
```
Look for `hs_email_direction: FORWARDED_EMAIL` (outbound from HubSpot).

**Option B — If associations return nothing**, check the task body for context
about what was sent.

**Option C — If neither has info**, fall back to the research process in
`skills/email-writer/research-campaign.md` to find a deal hook.

Extract from the email:
- The **deal name or personalization token** from the subject line
- The **company name** referenced in the body
- The **hook type** (deal attribution, firm-level, problem-led)

These carry over into the LinkedIn message for continuity.

### Step 4 — Research (Only If Needed)

If Step 3 returned the original email with a clear deal hook, **skip full research.**
You already have the personalization token.

Only run the research process (`skills/email-writer/research-campaign.md`) if:
- No email history was found for the contact
- The email subject was generic with no deal/company hook
- The task body specifically mentions a new deal or context to use

When research IS needed, use the abbreviated version:
- Company: 1 web search + 1 news/portfolio page fetch
- Contact: 1 bio page check for deal attribution
- Skip contacts in non-deal roles (IR, Marketing, Compliance, Finance/Accounting, EAs)

### Step 5 — Write LinkedIn Messages

Follow `skills/linkedin-writer/linkedin-message-style.md` for message format and rules.

**Key framing:** These are warm follow-ups, not cold outreach. The contact opened
Raleigh's email. Tim is now reaching out personally on LinkedIn. The message should:
- Lightly acknowledge prior contact (NOT "I saw you opened my email")
- Use the same personalization token from the email
- Make an assumptive ask for a demo ("when" not "if")

Write one message per contact. Choose the format based on context:

| Scenario | Format |
|---|---|
| Not yet connected on LinkedIn | Connection Request (under 300 chars) |
| Already connected | Direct Message (under 600 chars) |
| Multiple prior touchpoints, gone cold | Re-engagement (under 400 chars) |

**Default to Connection Request** unless the task body indicates they're already connected.

### Step 6 — Output

Present results as a clean, copy-paste-ready document:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK: [Task Subject]
DUE: [Due Date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTACT: [First Last] — [Title] at [Company]
LINKEDIN: [LinkedIn URL or "not on file"]
MESSAGE TYPE: [Connection Request / DM / Re-engagement]
ORIGINAL EMAIL SUBJECT: [Subject line they opened, or "not found"]
DEAL HOOK: [Deal/personalization token carried over]

---MESSAGE START---
[Ready-to-paste LinkedIn message]
---MESSAGE END---

Character count: [X] / [limit]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

At the end, include a summary:

```
## Summary
- Total LinkedIn tasks: X
- Messages drafted: X
- Skipped (no contact info): X
- Connection requests: X
- Direct messages: X
- Re-engagements: X
```

### Step 7 — Cleanup

Delete all `/tmp/hs_linkedin_*.json` files.

---

## Error Handling

| Error | Action |
|---|---|
| No owner found | Report and stop |
| No LinkedIn tasks | Report: "No open LinkedIn tasks for [name]." Stop. |
| No contact on task | Note in output, skip to next task |
| No LinkedIn URL | Still draft the message, note "LinkedIn URL not on file" |
| API error | Report clearly, do not guess at data |

---

## Implementation Rules

Same as task-pull agent:
- Write curl responses to temp files, process in Python
- Do NOT embed API responses in shell variables
- Use `curl -s ... -o /tmp/hs_linkedin_<step>.json` pattern
- Keep the entire flow in a single Python script that calls curl via subprocess when possible
