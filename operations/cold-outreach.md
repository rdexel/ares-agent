# Cold Outreach Runbook

End-to-end: pull contacts from a HubSpot list, research each company for a deal hook, write personalized cold emails in Raleigh's voice, get approval, write personalization tokens to HubSpot, and enroll contacts in the correct sequence.

**Before running:** read [../playbooks/email-voice.md](../playbooks/email-voice.md) and [../playbooks/research.md](../playbooks/research.md). Check the relevant campaign file in [../campaigns/](../campaigns/) for current hypothesis and lessons.

---

## Inputs

| Input | Description |
|-------|-------------|
| `lists` | Which HubSpot lists to pull from (names or IDs) |
| `company_count` | How many companies per list (e.g., 3) |

If either is missing, ask once before proceeding.

## Reference

All IDs (owners, lists, sequences, sender config) live in [../reference/hubspot.md](../reference/hubspot.md). Don't look them up via API — they're stable.

---

## The six-step workflow

### Step 1 — Pull contacts from HubSpot

For each list:

1. **Paginate full memberships** (list sizes are 250+):
   ```
   GET /crm/v3/lists/<listId>/memberships?limit=250
   ```
   Continue with `?after=<cursor>` until exhausted.

2. **Batch-read contact details** (up to 100 at a time):
   ```
   POST /crm/v3/objects/contacts/batch/read
   ```
   Properties: `firstname, lastname, email, jobtitle, hs_linkedin_url, associatedcompanyid, lifecyclestage, hs_lead_status, hs_sequences_is_enrolled, hs_sequences_actively_enrolled_count`

3. **Filter contacts:**
   - Must have email.
   - `hs_lead_status` is empty (not being worked).
   - `hs_sequences_is_enrolled` is NOT true.
   - `hs_sequences_actively_enrolled_count` is 0.
   - Role filter per [../playbooks/research.md](../playbooks/research.md) — BEFORE research.

4. **Group by email domain** (NOT `associatedcompanyid` — associations are unreliable).
   - Rank domains by contact count.
   - Pick top N companies per list, avoiding:
     - Companies already in pipeline (check [../state/contact-monitor.json](../state/contact-monitor.json))
     - Companies that overlap across lists
     - Generic domains (gmail.com, yahoo.com, outlook.com, hotmail.com)

### Step 2 — Research each company

Launch research agents **in parallel** (one per company). Each follows [../playbooks/research.md](../playbooks/research.md).

Each returns:
- Company description (1 line)
- Recent deals (2–3) with dates and **deal type** (acquisition, sale, exit, investment, mandate, platform investment, recapitalization, etc.)
- Team attribution — which contacts are named on which deals

**Deal type is mandatory.** A bare deal name is useless in the opener.

### Step 3 — Write personalized emails

Follow [../playbooks/email-voice.md](../playbooks/email-voice.md).

For each contact produce 7 fields (one per custom HubSpot property):

| Field | Purpose |
|-------|---------|
| `socratics_email_subject` | Subject line (under 60 chars, references financial modeling + deal/firm) |
| `socratics_email_opener` | Opener that earns attention, leads with product value tied to their deal |
| `socratics_email_body` | Body ("At Socratics.ai, we..." + pain point + fix) |
| `socratics_email_cta` | CTA naming the company team |
| `socratics_deal_hook` | Deal name + descriptor ("the Spartaco acquisition") |
| `socratics_deal_type` | Deal type (acquisition, sale, exit, etc.) |
| `socratics_company_team` | Company team name ("the CenterGate team") |

**Hard rules (see email-voice.md for full detail):**
- Opener leads with product value. Never "Curious how..." / "How long did..."
- Body says "At Socratics.ai, we..."
- Deal names always paired with type descriptor
- CTA names the company team
- No sign-off (cold touch #1)
- Under 150 words total

### Step 4 — Present for review (STOP AND WAIT)

**Do NOT proceed to Step 5 without explicit approval.**

Present all drafts in this format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIST: [List Name]  →  SEQUENCE: [Sequence Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPANY: [Company Name] ([domain])

  [Contact Name] — [Title]
  SUBJECT: [subject]
  OPENER: [opening sentence]
  BODY: [body paragraph]
  CTA: [cta with company name]
  DEAL HOOK: [deal name + type]

  ---

  [Next contact]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

READY TO ENROLL:
- [List Name]: X contacts across Y companies → [Sequence Name]
- Total: X contacts

Say "go" to write properties and enroll, or flag edits.
```

### Step 5 — Write personalization tokens to HubSpot

After approval:

```
PATCH /crm/v3/objects/contacts/<contactId>
{
  "properties": {
    "socratics_deal_hook": "...",
    "socratics_deal_type": "...",
    "socratics_email_subject": "...",
    "socratics_email_opener": "...",
    "socratics_email_body": "...",
    "socratics_email_cta": "...",
    "socratics_company_team": "..."
  }
}
```

Use batch operations where possible. Report any failures — don't enroll failed contacts.

### Step 6 — Enroll in sequences

Map list → sequence per [../reference/hubspot.md](../reference/hubspot.md). For each contact:

```
POST /automation/sequences/2026-03/enrollments?userId=161977243
{
  "contactId": "<contactId>",
  "sequenceId": "<sequence_id_for_this_list>",
  "senderEmail": "raleigh@socratics.ai",
  "senderAliasAddress": "tim.ceo@socratics.io"
}
```

**Error handling:**
| Error | Action |
|-------|--------|
| Contact already enrolled | Skip, report |
| No connected inbox | Stop, report — sender config is wrong |
| Rate limit (1,000/day/inbox) | Pause, report remaining count |

Report final tally:
```
ENROLLMENT COMPLETE:
- Enrolled: X
- Skipped (already enrolled): X
- Failed: X
- Sending from: tim.ceo@socratics.io (via raleigh@socratics.ai)
```

---

## Error handling

| Error | Action |
|-------|--------|
| 401 Unauthorized | Stop. "Invalid or missing HUBSPOT_API_KEY." |
| 404 | Report which resource. Continue with rest. |
| 429 | Wait 10s, retry once. If still failing, pause and report. |
| Empty list | Report "No eligible contacts in [list]." Stop. |
| Property write failure | Report contacts that failed. Do not enroll them. |

---

## Cleanup

Delete all `/tmp/hs_*.json` temp files when done.

---

## After the run

Update the relevant campaign file in [../campaigns/](../campaigns/) with:
- Run date
- Contact count enrolled
- Any new lesson learned (also promote to [../playbooks/lessons.md](../playbooks/lessons.md) if it's not already there)
