# Skill: HubSpot Data Pull

Pull a specified number of companies from a HubSpot segment, then pull every contact
associated with each of those companies.

---

## Authentication

All API calls require a Bearer token header:
```
Authorization: Bearer $HUBSPOT_API_KEY
```

The key is stored as the environment variable `HUBSPOT_API_KEY`. Never hardcode it.

---

## Step 1 — Get the List ID for the Segment

If the user provided a segment name (not an ID), resolve it first.

```
POST https://api.hubapi.com/crm/v3/lists/search
Content-Type: application/json

{
  "query": "<segment_name>",
  "objectTypeId": "0-2"
}
```

`objectTypeId: "0-2"` targets company lists. Use `"0-1"` if the segment contains contacts.

From the response, extract the `listId` of the matching list.

**If the user provided a numeric list ID directly, skip this step.**

---

## Step 2 — Get Companies from the List

```
GET https://api.hubapi.com/crm/v3/lists/<listId>/memberships
    ?limit=<company_count>
```

This returns an array of `recordId` values — these are HubSpot company IDs.

**Pagination:** If the response includes a `paging.next.after` cursor and you haven't
reached `company_count` yet, paginate by adding `?after=<cursor>` to the next request.
Continue until you have exactly `company_count` companies or the list is exhausted.

---

## Step 3 — Get Company Details

For each company ID, fetch its properties:

```
GET https://api.hubapi.com/crm/v3/objects/companies/<companyId>
    ?properties=name,domain,website,industry,city,state,description
```

Store for each company:
- `name`
- `domain` / `website`
- `industry`
- `city`, `state`
- `description` (if present)

---

## Step 4 — Get All Contacts for Each Company

For each company ID:

```
GET https://api.hubapi.com/crm/v3/objects/companies/<companyId>/associations/contacts
```

This returns an array of contact IDs associated with the company.

Then batch-fetch contact details (up to 100 at a time):

```
POST https://api.hubapi.com/crm/v3/objects/contacts/batch/read
Content-Type: application/json

{
  "inputs": [
    { "id": "<contactId1>" },
    { "id": "<contactId2>" },
    ...
  ],
  "properties": [
    "firstname",
    "lastname",
    "email",
    "jobtitle",
    "linkedin_bio",
    "hs_linkedin_url",
    "phone",
    "lifecyclestage",
    "hs_lead_status"
  ]
}
```

Store for each contact:
- `firstname`, `lastname`
- `email`
- `jobtitle`
- `hs_linkedin_url` (LinkedIn profile URL if available)
- `lifecyclestage` + `hs_lead_status` (to confirm they are cold/uncontacted)

---

## Step 5 — Filter Contacts

Only include contacts where:
- `email` is present (no email = can't be outreached)
- `lifecyclestage` is `lead`, `subscriber`, or empty (not already a customer/opportunity)
- `hs_lead_status` is NOT `IN_PROGRESS`, `OPEN_DEAL`, or `CONNECTED` (skip anyone
  already being worked)

---

## Output Structure

Return a list in this format (pass to the research step):

```json
[
  {
    "company": {
      "id": "12345",
      "name": "Arclight Partners",
      "website": "arclightpartners.com",
      "industry": "Private Equity",
      "city": "New York",
      "state": "NY"
    },
    "contacts": [
      {
        "id": "67890",
        "name": "Derek Sousa",
        "email": "derek@arclightpartners.com",
        "title": "Managing Director",
        "linkedin_url": "https://linkedin.com/in/dereksousa"
      }
    ]
  }
]
```

---

## Error Handling

| Error | Action |
|---|---|
| 401 Unauthorized | Stop. Report: "Invalid or missing HUBSPOT_API_KEY." |
| 404 Not Found | Report which list ID or company ID was not found. Continue with rest. |
| 429 Rate Limited | Wait 10 seconds, retry once. If it fails again, pause and report. |
| Empty list | Report "No companies found in segment [name]." Stop. |
| Company has no contacts | Note it in output, skip to next company. |

---

## Rate Limit Notes

- HubSpot allows 110 requests per 10 seconds for standard private apps
- The `/contacts/search` endpoint is exempt from the per-10-second limit
- Batch endpoints (batch/read) count as one call regardless of how many records — prefer
  them over individual GET calls whenever fetching multiple records
