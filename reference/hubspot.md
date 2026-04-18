# HubSpot Reference

Canonical HubSpot IDs, API patterns, and custom properties. Everything that would otherwise be duplicated across runbooks lives here.

---

## Auth

```
Authorization: Bearer $HUBSPOT_API_KEY
```

**Base URL:** `https://api.hubapi.com`
**Rate limit:** 110 requests / 10 seconds (Search endpoint is exempt from the 10s rule).
**Sequence enrollment limit:** 1,000 per portal inbox per day.

---

## Owners

| Email | Owner ID | Name |
|-------|----------|------|
| timeun@gmail.com | `161538153` | Tim Eun |
| raleigh@socratics.ai | `161977243` | Raleigh Dexel |

---

## Lists

| List | ID | Type | Approx size |
|------|-----|------|-------------|
| Deal Analyst - IB/PE | `14` | Contact (0-1), dynamic | ~530 |
| Deal Reviewer - IB/PE | `15` | Contact (0-1), dynamic | ~260 |
| IC Buyer - PE/IB | `16` | Contact (0-1), dynamic | ~672 |
| Pre Launch Interest | `23` | Snapshot | ~141 |
| Replied | `58` | Dynamic | ~39 |
| Batch 2 Bounce | `7` | Dynamic | ~1 |

**List lookup by name:**
```
POST /crm/v3/lists/search
Body: {"query": "<name>", "objectTypeId": "0-1"}
```
`objectTypeId`: `0-1` = contacts, `0-2` = companies.

---

## Sequences

| Sequence | ID | Maps to list |
|----------|-----|--------------|
| Deal Analyst Sequence | `558893796` | `14` |
| Deal Reviewer Sequence | `558893799` | `15` |
| IC Buyer Sequence | `559020782` | `16` |

**Enrollment endpoint:**
```
POST /automation/sequences/2026-03/enrollments?userId=161977243
{
  "contactId": "<id>",
  "sequenceId": "<sequence_id>",
  "senderEmail": "raleigh@socratics.ai",
  "senderAliasAddress": "tim.ceo@socratics.io"
}
```

---

## Sender config (cold outreach)

| Field | Value |
|-------|-------|
| `senderEmail` | `raleigh@socratics.ai` |
| `senderAliasAddress` | `tim.ceo@socratics.io` |
| `userId` | `161977243` |

---

## Pipeline stages

| ID | Name |
|----|------|
| `3394403052` | Demo Interest |
| `appointmentscheduled` | Demo Scheduled |
| `3380746945` | Initial Demo |
| `3381702384` | Second Demo |
| `qualifiedtobuy` | Trial / Testing |
| `presentationscheduled` | Presentation Scheduled |
| `decisionmakerboughtin` | Decision Maker Bought-In |
| `contractsent` | Contract Sent |
| `closedwon` | Closed Won |
| `closedlost` | Closed Lost |

---

## Custom contact properties (cold sequence personalization)

Seven properties. Written once per contact, read by sequence templates via `{{contact.socratics_*}}`.

| Property | Purpose |
|----------|---------|
| `socratics_deal_hook` | Deal name + descriptor ("the Spartaco acquisition") |
| `socratics_deal_type` | acquisition, sale, exit, investment, mandate, platform investment, recapitalization, etc. |
| `socratics_email_subject` | Subject for email 1 |
| `socratics_email_opener` | Opening sentence for email 1 |
| `socratics_email_body` | Body paragraph for email 1 |
| `socratics_email_cta` | CTA with company team name |
| `socratics_company_team` | Company team name ("the CenterGate team") |

Follow-up emails reuse `{{contact.socratics_deal_hook}}` and `{{contact.socratics_company_team}}` for cross-touch continuity.

---

## Common endpoints

| Endpoint | Method | Use |
|----------|--------|-----|
| `/crm/v3/objects/contacts/search` | POST | Search / filter contacts |
| `/crm/v3/objects/contacts/batch/read` | POST | Batch read (up to 100) |
| `/crm/v3/objects/contacts/<id>` | PATCH | Update contact properties |
| `/crm/v3/objects/deals/search` | POST | Search / filter deals |
| `/crm/v3/objects/tasks/search` | POST | Tasks by owner / status / type |
| `/crm/v3/objects/emails/search` | POST | Email engagement search |
| `/crm/v3/objects/meetings/search` | POST | Meetings |
| `/crm/v3/objects/companies/batch/read` | POST | Company names (batch) |
| `/crm/v3/lists/<id>/memberships` | GET | List members (paginate `?after=`) |
| `/crm/v3/lists/search` | POST | Find list by name |
| `/crm/v3/objects/<type>/<id>/associations/<toType>` | GET | Associations |
| `/automation/sequences/2026-03/enrollments` | POST | Enroll in sequence |

---

## Error handling conventions

| Code | Meaning | Action |
|------|---------|--------|
| 401 | Unauthorized | Stop. Report: "Invalid or missing HUBSPOT_API_KEY." |
| 404 | Not found | Report which resource. Continue with rest. |
| 429 | Rate limited | Wait 10 seconds, retry once. If fails again, pause and report. |

---

## Implementation rules

- Use curl (macOS urllib SSL issues).
- Write curl output to `/tmp/hs_*.json` temp files, read in Python.
- Never embed raw API JSON in shell variables or heredocs.
- Batch endpoints preferred — they count as 1 call regardless of record count.
- See [../playbooks/hubspot-patterns.md](../playbooks/hubspot-patterns.md) for why these rules exist.
