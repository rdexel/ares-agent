# Task Pull Runbook

Export open HubSpot tasks for a given owner as a TSV table ready to paste into Google Sheets.

Reference: [../reference/hubspot.md](../reference/hubspot.md).

---

## Inputs

| Input | Description |
|-------|-------------|
| `owner_email` | HubSpot owner (default: `timeun@gmail.com` → owner ID 161538153) |

---

## Workflow

### Step 1 — Resolve owner ID

Skip lookup if email matches a known owner ([../reference/hubspot.md](../reference/hubspot.md) has the table). Otherwise:

```
GET /crm/v3/owners?email=<owner_email>
```

### Step 2 — Pull open tasks

```
POST /crm/v3/objects/tasks/search
{
  "filterGroups": [{
    "filters": [
      { "propertyName": "hubspot_owner_id", "operator": "EQ", "value": "<owner_id>" },
      { "propertyName": "hs_task_status",   "operator": "EQ", "value": "NOT_STARTED" }
    ]
  }],
  "properties": ["hs_task_subject","hs_task_body","hs_task_status","hs_task_priority","hs_timestamp","hs_task_type"],
  "sorts": [{"propertyName": "hs_timestamp", "direction": "ASCENDING"}],
  "limit": 100
}
```

### Step 3 — Resolve contacts + companies

Try contact associations first:
```
GET /crm/v3/objects/tasks/<taskId>/associations/contacts
```

**Tasks often have no contact associations.** Fall back to parsing contact name + company from the task subject:

| Subject pattern | Example |
|-----------------|---------|
| "Follow up with [Name] from [Company]" | Follow up with Brian McDonald from Bay Advisory |
| "Follow up: Follow up with [Name] from [Company]" | Nested form of the above |
| "Schedule with [Name]" | No company — use known mapping |
| "Call [Name]" | No company — use known mapping |
| "Reschedule with [Name]" | No company — use known mapping |

**Known contact → company mappings** (update when new contacts appear):

| Contact | Company |
|---------|---------|
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

If associations ARE found, batch-read:
```
POST /crm/v3/objects/contacts/batch/read
properties: firstname, lastname, jobtitle, email, associatedcompanyid
```
Then batch-read company names.

### Step 4 — Output TSV

Columns (tab-separated):

```
Task	Contact	Company	Due Date	Priority	Type	Status
```

Rules:
- Due Date: `MM/DD/YYYY`
- Priority: `High` or blank
- Type: `Call` / `Email` / `To-do`
- Status: always `Open`
- Sort by due date ascending
- Wrap in a code block for easy copy

Tell the user to paste into cell A1 of a Google Sheet.

---

## Error handling

| Error | Action |
|-------|--------|
| No owner found | Stop: "No HubSpot owner found for <email>." |
| No open tasks | Stop: "No open tasks for <name>." |
| API error | Report clearly; don't guess at data |
