# AGENT.md — Task Pull Agent

You are an agent that pulls open HubSpot tasks for a given user and outputs them as a
tab-separated table ready to paste into Google Sheets.

---

## Inputs (User Provides at Start)

| Input | Description |
|---|---|
| `owner_email` | The HubSpot owner's email (default: timeun@gmail.com) |

If no email is provided, use the default.

---

## Authentication

All API calls require:
```
Authorization: Bearer $HUBSPOT_API_KEY
```

Use curl for all API calls (not Python urllib — SSL issues on macOS).

---

## Workflow

### Step 1 — Resolve Owner ID

```
GET https://api.hubapi.com/crm/v3/owners?email=<owner_email>
```

Extract the `id` field from the first result. This is the HubSpot owner ID.

**Known owner IDs (skip lookup if match):**
| Email | Owner ID | Name |
|---|---|---|
| timeun@gmail.com | 161538153 | Tim Eun |

### Step 2 — Pull Open Tasks

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

### Step 3 — Get Associated Contacts and Companies

First, try fetching associated contacts via the API:
```
GET https://api.hubapi.com/crm/v3/objects/tasks/<taskId>/associations/contacts
```

**IMPORTANT: Tasks in this workspace are often NOT linked to contact records.**
If associations come back empty, parse the contact name and company from the task subject.
Common patterns:
- "Follow up with [Name] from [Company]"
- "Follow up: Follow up with [Name] from [Company]"
- "Schedule with [Name]"
- "Call [Name]"
- "Reschedule with [Name]"

For company names not in the subject, use these known mappings:
| Contact | Company |
|---|---|
| Brian McDonald | Bay Advisory |
| Jas Dhaliwal | Lark Street Capital |
| Dan Searle | Oaklins |
| Michael Gravel | iMerge Advisors |
| Harry Reid | Lempriere Wells |
| Dean | Enertech Capital |
| Peter Muncey | — |
| Erik Eidem | — |
| Jessica Zhang | Cade Partners |
| Duc Luu | Dynam Capital |
| Stephen Kelly | Bay Advisory |
| Jon Conquergood | — |
| Paul Clausing | Fluential |

If contact associations ARE found, batch-read details:
```
POST https://api.hubapi.com/crm/v3/objects/contacts/batch/read
Properties: firstname, lastname, jobtitle, email, associatedcompanyid
```

Then batch-read company names:
```
POST https://api.hubapi.com/crm/v3/objects/companies/batch/read
Properties: name
```

### Step 4 — Output as Google Sheets Table

Output a **tab-separated** table with these columns:

```
Task	Contact	Company	Due Date	Priority	Type	Status
```

Rules:
- Due Date should be formatted as `MM/DD/YYYY`
- Priority: show "High" or leave blank for NONE
- Type: show "Call", "Email", or "To-do"
- Status: always "Open"
- Sort by due date ascending (soonest first)
- Wrap the table in a code block so it's easy to copy

Tell the user to paste directly into cell A1 of a Google Sheet — tabs will auto-separate into columns.

---

## Implementation Rules

**CRITICAL: Never embed raw API JSON responses into shell variables or Python heredocs.**
HubSpot responses contain HTML, newlines, quotes, and special characters that will break
JSON parsing if interpolated into strings.

Instead, use this pattern:
1. Write each curl response directly to a temp file: `curl -s ... -o /tmp/hs_tasks.json`
2. Process the file in Python using `json.load(open('/tmp/hs_tasks.json'))`
3. Write intermediate results to temp files if needed between steps
4. Delete all temp files at the end: `rm -f /tmp/hs_*.json`

**Do NOT:**
- Embed API responses in bash variables and pass to Python via `'''$VAR'''`
- Use shell heredocs to pass JSON between commands
- Assume API response strings are safe for shell interpolation

**Do:**
- Pipe curl output directly to Python: `curl -s ... | python3 -c "..."`
- Or write to temp files and read in Python
- Keep the entire flow in a single Python script that calls curl via subprocess

---

## Error Handling

| Error | Action |
|---|---|
| No owner found | Report: "No HubSpot owner found for <email>." Stop. |
| No open tasks | Report: "No open tasks for <name>." Stop. |
| API error | Report the error clearly. Do not guess at data. |
