# Email-Writer Agent Runbook

Read this file FIRST before running any campaign. It contains the optimized process and lessons learned from prior runs.

---

## Quick-Start Checklist

1. Confirm inputs: `lists` (which lists to pull from), `company_count` (per list)
2. Confirm `HUBSPOT_API_KEY` is set
3. Read all skill files (hubspot-data-pull.md, research-campaign.md, raleigh-email-style.md)
4. Execute the 6-step workflow in AGENT.md
5. **STOP at Step 4 — present emails for review, wait for approval**
6. After approval: write properties to contacts, enroll in sequences
7. Clean up all temp/cached data when done
8. Append lessons learned to this file

## Enrollment Configuration

| Setting | Value |
|---|---|
| Sender email | `raleigh@socratics.ai` |
| Sender alias | `tim.ceo@socratics.io` |
| User ID | `161977243` |
| API endpoint | `POST /automation/sequences/2026-03/enrollments?userId=161977243` |
| Daily limit | 1,000 enrollments per inbox |

**List → Sequence mapping:**
| List | List ID | Sequence | Sequence ID |
|---|---|---|---|
| Deal Analyst | 14 | Deal Analyst Sequence | 558893796 |
| Deal Reviewer | 15 | Deal Reviewer Sequence | 558893799 |
| IC Buyer | 16 | IC Buyer Sequence | 559020782 |

**Custom contact properties (already created, used by sequence templates):**
`socratics_deal_hook`, `socratics_deal_type`, `socratics_email_subject`,
`socratics_email_opener`, `socratics_email_body`, `socratics_email_cta`,
`socratics_company_team`

---

## Optimized 3-Step Workflow

### Step 1 — HubSpot Data Pull (target: 2-3 API calls)

**List lookup:**
```
POST https://api.hubapi.com/crm/v3/lists/search
Body: {"query": "<segment_name>", "objectTypeId": "0-1"}
```
- Deal Reviewer - IB/PE = List ID 15 (contact list, objectTypeId 0-1)
- Deal Analysts - IB/PE = List ID 14
- IC Buyer - PE/IB = List ID 16
- Pre Launch Interest = List ID 23
- Replied = List ID 58
- Batch 2 Bounce = List ID 7

**Known list IDs (cache these — they don't change often):**
| List | ID | Type | Approx Size |
|---|---|---|---|
| Deal Reviewer - IB/PE | 15 | DYNAMIC | 260 |
| Deal Analysts - IB/PE | 14 | DYNAMIC | 530 |
| IC Buyer - PE/IB | 16 | DYNAMIC | 672 |
| Pre Launch Interest | 23 | SNAPSHOT | 141 |
| Replied | 58 | DYNAMIC | 39 |
| Batch 2 Bounce | 7 | DYNAMIC | 1 |

**Pull memberships in parallel (use curl, not Python urllib — SSL issues on macOS):**
```bash
curl -s "https://api.hubapi.com/crm/v3/lists/<listId>/memberships?limit=250" \
  -H "Authorization: Bearer $HUBSPOT_API_KEY"
```

**Filtering contacts not in other segments:**
- Pull memberships from ALL other lists in parallel (single bash loop, not sequential)
- Compute set difference in Python
- This is critical when user asks for exclusive leads

**Batch-read contacts (up to 100 per call):**
```
POST https://api.hubapi.com/crm/v3/objects/contacts/batch/read
Properties: firstname, lastname, email, jobtitle, hs_linkedin_url, lifecyclestage, hs_lead_status, associatedcompanyid
```
- `associatedcompanyid` gives you the company ID directly — no need for a separate associations API call
- Group contacts by `associatedcompanyid` in Python, pick top N companies by contact count

**Company details (batch if possible, otherwise individual GETs):**
```
GET https://api.hubapi.com/crm/v3/objects/companies/<id>?properties=name,domain,website,industry,city,state,description
```

### Step 2 — Research (target: 3-4 web searches + 5-8 web fetches per company)

**Priority order — do these in parallel across all companies:**

1. **Web search per company:** `"<Company Name>" deal acquisition investment 2025 2026` — gives you recent deals in one shot
2. **Company news page:** `https://<domain>/news/` — usually has all announcements
3. **Company team page:** `https://<domain>/team/` — check for deal attribution per contact
4. **Individual bio pages** (only for contacts with no attribution from team page): `https://<domain>/team/<name>` or `/employee/<name>`
5. **Targeted web search** (only if bio pages have no attribution): `"<First Last>" "<Company>" deal`

**Key shortcuts discovered:**
- Sterling Group team page (`/team/`) lists portfolio company attributions per person — one fetch gets all contacts
- Altamont team page (`/team/all/`) lists everyone but has NO deal attribution — must check individual `/employee/<name>` pages
- Crestview team page doesn't render names in fetch — must search for individual `/team/<name>` pages
- Press releases almost never name VPs on deal teams — skip unless looking for MDs/Partners
- Don't bother fetching LinkedIn — it rarely renders useful content via WebFetch

**Role filtering (do BEFORE research to save time):**
- Filter out: IR/Marketing, VP of Finance/Accounting, Managers (likely admin), EAs, Compliance
- Keep: VPs (investment team), Principals, Associates, Directors, MDs, Partners
- Alex Mardirossian (Crestview) = IR role, always filter
- Jyot Chadha (Altamont) = VP Finance, always filter

### Step 3 — Write Emails

**Subject line formula (VARY every time):**
- `Modeling the [Deal] financials in 10 minutes`
- `[Deal] deal: faster financial modeling`
- `[Deal] deal: audit-ready models in 10 minutes`
- `Faster modeling on the [Deal] mandate`
- `10-minute financial models for [Company]`
- `Financial models for the [Deal] deal`
- `Faster modeling for the [Company] deal team`

**Opener patterns (MUST earn attention — lead with product value, not questions about them):**
1. "What if" tied to deal: "What if the 3-statement model for the [Deal] acquisition was done in 10 minutes instead of 10 hours?"
2. Direct statement: "The 3-statement model for the [Deal] sale, done in 10 minutes. That's what we're building at Socratics.ai."
3. Bold claim: "Raw financials to a fully linked 3-statement model in 10 minutes. That's what we're building at Socratics.ai."
4. Pain + product: "[Deal type] financials are some of the messiest to model from scratch. What if the [Deal] 3-statement model was done in 10 minutes?"
5. Timely: "Congrats on the [Deal] acquisition. What if the 3-statement model on the next platform investment was done in 10 minutes?"

**CRITICAL: Always clarify what the deal name IS.** Never drop a bare name like "Spartaco"
or "ABH" without context. Always pair with a deal descriptor: "the Spartaco acquisition,"
"the ABH recapitalization," "the Franchise Creator sale," "the RF Technologies investment."
Use: acquisition, sale, investment, recapitalization, mandate, platform investment, exit,
add-on, close. If unknown, "deal" is always safe.

**NEVER open with:** "Curious how...", "How long did...", "How much time does your team spend..."
These are weak — they ask without giving. The reader has no reason to keep reading.

**Body pattern (conversational, not a feature list):**
- Must say "At Socratics.ai, we..." to name the company
- Hit the pain point: upstream time loss, messy data, manual rebuilds, numbers that don't tie out
- Connect to what Socratics fixes: intake layer, structuring raw data, formula-linked output
- Optional: "200+ PE teams and banks use us" proof point
- Keep it human — write like you're explaining to a peer, not listing features

**CTA (always names the company team):**
- "Happy to show the [Company] team how it works."
- "Would love to show the [Company] team what this looks like."
- "Happy to walk the [Company] team through it."

**Hard rules:**
- No personal details in email body
- No exclamation points
- No sign-off (no "Best," — signature handles it)
- No em-dashes (use commas or new sentences)
- No hollow openers
- Under 150 words

---

## Lessons Learned

### Run 1 — 2026-03-26
- **Segment:** Deal Reviewer - IB/PE (List 15), 3 companies
- **Total time bottleneck:** Research phase — too many sequential web fetches
- **What worked:**
  - Parallel web searches for all 3 companies simultaneously (huge time saver)
  - Using `associatedcompanyid` in batch contact read to skip the associations API call
  - Fetching company team pages for deal attribution (Sterling Group's was excellent)
  - Filtering all other list memberships in one bash loop
- **What was slow/wasted:**
  - Python urllib SSL failures on macOS — always use curl for API calls
  - Fetching Crestview `/firm` and `/team` pages that didn't render names — go straight to `/team/<name>` individual pages
  - Searching for individual contacts who turned out to be non-deal roles (Jyot Chadha, Alex Mardirossian) — filter roles BEFORE researching
  - Altamont portfolio page listed companies but no team attribution — skip it, go straight to `/employee/<name>` pages
- **Optimization for next run:**
  - Filter contacts by title BEFORE starting research (save 3-4 web fetches)
  - For known firms, cache the URL patterns that work (e.g., Sterling = `/team/`, Altamont = `/employee/<name>/`)
  - Run all company web searches + news page fetches in a single parallel batch at the start
  - Run all individual bio page fetches in a second parallel batch
  - Skip press releases for VP-level attribution (they only name MDs/Partners)

### Run 2 — 2026-04-08
- **Segment:** All 3 lists (Deal Analysts 14, Deal Reviewers 15, IC Buyers 16), 3 companies each
- **Total contacts:** 27 emails across 9 companies
- **What worked:**
  - Grouping contacts by email domain instead of trusting `associatedcompanyid` — HubSpot's company-contact associations were wrong in many cases (Sageview showing Crestview emails, Clearview showing Altamont emails). Domain grouping is reliable.
  - Running 9 research agents in parallel (one per company) — all 9 came back in ~75 seconds
  - Filtering out non-deal roles BEFORE research: assistants, EAs, compliance, HR, marketing, finance/accounting, operations, legal, IR, membership, chief of staff
  - Picking companies that DON'T overlap across lists and avoiding firms already in pipeline (Sterling, Altamont, Crestview, Wind Point)
- **Email writing feedback (from Raleigh):**
  - NEVER open with "Curious how..." or "How long did..." — these are weak, they ask without giving. The reader has no reason to keep reading.
  - Lead with what Socratics CAN DO, not a question about the prospect's experience
  - Must say "At Socratics.ai, we..." in every email — names the company and flows into the pitch
  - No "Best," sign-off — signature handles it
  - CTA must always name the company team: "Happy to show the [Company] team how it works"
  - ALWAYS clarify what a deal name IS — never drop a bare name like "Spartaco" without context. Always pair with a deal descriptor: "the Spartaco acquisition," "the RF Technologies investment"
  - Middle paragraphs need to sound human and conversational, not like a feature list. Hit the pain point (upstream time loss, messy data, manual rebuilds) and connect it to what Socratics fixes.
- **Optimization for next run:**
  - Use email domain grouping as the primary company-contact mapping, not `associatedcompanyid`
  - Have the research agents also identify the deal TYPE (acquisition, sale, exit, platform investment, etc.) so subject lines and openers can reference it correctly
  - Paginate list memberships from the start — all 3 lists had 250+ members
