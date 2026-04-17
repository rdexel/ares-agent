# Skills Reference

Quick-reference for all skills in this workspace. Read this to know which skill to use for a given task.

---

## Skill Map

| Task | Skill | Entry Point |
|------|-------|-------------|
| Write cold outreach emails | Email Writer | `skills/email-writer/AGENT.md` |
| Draft any email as Raleigh | Raleigh Email Style | `skills/email-writer/raleigh-email-style.md` |
| Research companies/deals for outreach | Research Campaign | `skills/email-writer/research-campaign.md` |
| Pull contacts from HubSpot lists | HubSpot Data Pull | `skills/email-writer/hubspot-data-pull.md` |
| Write LinkedIn follow-up messages | LinkedIn Writer | `skills/linkedin-writer/AGENT.md` |
| Pull open HubSpot tasks | Task Pull | `skills/task-pull/AGENT.md` |
| Scan for high-priority CRM activity | Contact Monitor | `skills/contact-monitor/AGENT.md` |
| Generate daily GTM report | Daily Report | `skills/daily-report/AGENT.md` |
| Generate meeting briefs (.docx) | Meeting Briefs | `skills/briefs/meeting-briefs.js` |
| Analyze replied segment follow-ups | Replied Follow-ups | `skills/replies/replied-followups.js` |

---

## Skill Details

### 1. Email Writer (Cold Outreach Agent)
**Path:** `skills/email-writer/AGENT.md`
**Supporting files:** `RUNBOOK.md`, `raleigh-email-style.md`, `research-campaign.md`, `hubspot-data-pull.md`
**What it does:** End-to-end cold outreach campaigns. Pulls contacts from HubSpot lists, researches each company for deal hooks, writes personalized emails in Raleigh's voice, presents for review, writes personalization tokens to HubSpot, and enrolls contacts in sequences.
**Inputs:** `lists` (which HubSpot lists), `company_count` (per list)
**6-Step Workflow:**
1. Pull contacts from HubSpot (filter by role, group by domain)
2. Research each company (parallel agents, find deal hooks)
3. Write personalized emails (subject, opener, body, CTA, deal hook)
4. Present for review (**STOP and wait for approval**)
5. Write personalization tokens to HubSpot contacts
6. Enroll in sequences

**Key rules:**
- Always read RUNBOOK.md first — it has lessons learned from prior runs
- Group contacts by email domain, NOT associatedcompanyid
- Filter non-deal roles BEFORE research
- Opener must lead with product value, never "Curious how..."
- Must say "At Socratics.ai, we..." in body
- CTA must name the company team
- No sign-off (no "Best,") in cold outreach
- Always clarify what deal names ARE (pair with descriptor)
- NEVER proceed past Step 4 without explicit approval

### 2. Raleigh Email Style
**Path:** `skills/email-writer/raleigh-email-style.md`
**What it does:** Voice/tone guide for writing any email as Raleigh. Use this for ALL email drafting — cold, warm, replies, follow-ups, networking, intros.
**Key voice rules:**
- Short paragraphs (1-3 sentences), no fluff
- No exclamation points in sales emails
- Sign-off: `Best,` with no name (signature handles rest). Exception: cold outreach has no sign-off at all
- No hollow openers ("Hope you're doing well")
- No em-dashes, no corporate buzzwords
- One ask per email
- Casual-professional tone
- Calendar links: Raleigh's = `https://meetings-na2.hubspot.com/raleigh-dexel`, Tim's = `https://meetings-na2.hubspot.com/tim-eun`

### 3. Research Campaign
**Path:** `skills/email-writer/research-campaign.md`
**What it does:** Research process for finding deal hooks and company intel. The #1 priority is deal-to-person attribution (finding a specific deal a contact worked on).
**Research priority:** Deal team attribution > Board seat > Investment thesis > LinkedIn deal post > Firm-level fallback
**Where to look:** Company portfolio pages (best), individual bio pages, press releases, web search
**Output:** Structured brief with company hook + per-contact deal attribution

### 4. HubSpot Data Pull
**Path:** `skills/email-writer/hubspot-data-pull.md`
**What it does:** Pulls companies and contacts from HubSpot lists. Handles list lookup, membership pagination, batch contact reads, and filtering.
**Key pattern:** Use `associatedcompanyid` property in batch contact read to skip separate associations API call. But for grouping, use email domain instead (more reliable).

### 5. LinkedIn Writer
**Path:** `skills/linkedin-writer/AGENT.md`
**Style guide:** `skills/linkedin-writer/linkedin-message-style.md`
**What it does:** Pulls LinkedIn tasks from HubSpot, retrieves original email context for continuity, and drafts LinkedIn messages for Tim (CEO) to send as warm follow-ups.
**Message types:**
| Type | Limit | When |
|------|-------|------|
| Connection Request | 300 chars | Not yet connected (default) |
| Direct Message | 600 chars | Already connected |
| Re-engagement | 400 chars | Gone cold, multiple prior touches |

**Key framing:** Tim introduces himself as CEO, flows into what Socratics does (one motion, not two stiff sentences), uses same deal hook from the original email, assumptive demo ask.

### 6. Task Pull
**Path:** `skills/task-pull/AGENT.md`
**What it does:** Pulls open HubSpot tasks for a given owner and outputs a tab-separated table for Google Sheets. Handles tasks with no contact associations by parsing names from task subjects.
**Default owner:** timeun@gmail.com (ID: 161538153)
**Output:** TSV table — Task, Contact, Company, Due Date, Priority, Type, Status

### 7. Contact Monitor
**Path:** `skills/contact-monitor/AGENT.md`
**What it does:** Scans HubSpot for high-priority activity in the last N hours. Produces a priority report (P0/P1/P2) covering email replies, deal stage changes, new meetings, and stale opportunities.
**State file:** `skills/contact-monitor/state.json` — tracks last run time, known deal stages
**API budget:** 6-8 calls per run
**Priority tiers:**
- P0 (Act Now): incoming reply, new meeting, deal stage advanced
- P1 (Follow Up): lifecycle change, email opens, close date approaching
- P2 (Watch): opportunity gone cold, deal moved backward

### 8. Daily Report
**Path:** `skills/daily-report/AGENT.md`
**What it does:** Comprehensive daily GTM report combining HubSpot (deals, tasks, contacts, emails) and Gmail (both raleigh@ and tim@ inboxes). Outputs an honest, blunt assessment with a Top 5 action list.
**Sections:** The Honest Take, Inbox Needs Action, Pipeline Status, Tasks Punch List, Sequence Health, Going Cold, Today's Top 5
**API budget:** ~10 HubSpot calls + 2 Gmail tool calls
**Tone:** Direct, no cheerful fluff. Flag what's broken.

### 9. Meeting Briefs (JS Script)
**Path:** `skills/briefs/meeting-briefs.js`
**What it does:** Standalone Node.js script. Fetches demo meetings from HubSpot for the current week, scrapes company websites, searches for attendee backgrounds, runs everything through Claude for analysis, and exports each brief as a `.docx` file.
**Env vars:** `HUBSPOT_ACCESS_TOKEN`, `ANTHROPIC_API_KEY`
**Run:** `node skills/briefs/meeting-briefs.js`
**Output:** `.docx` files in `skills/briefs/briefs/`

### 10. Replied Follow-ups (JS Script)
**Path:** `skills/replies/replied-followups.js`
**What it does:** Standalone Node.js script. Pulls contacts from the "Replied" segment in HubSpot, analyzes follow-up gaps, and prints a prioritized action report (Urgent / High / On Track / In Sequence).
**Env var:** `HUBSPOT_ACCESS_TOKEN`
**Run:** `node skills/replies/replied-followups.js`
**Thresholds:** 7 days since reply = urgent, 14 days since contact = going cold

---

## Implementation Rules (Apply to ALL skills)

- **curl for all HubSpot API calls** — Python urllib has SSL issues on macOS
- **Write API responses to temp files**, process in Python — never embed in shell vars
- **Delete temp files when done** (`rm -f /tmp/hs_*.json`)
- **Batch endpoints preferred** — count as 1 API call regardless of record count
- **Rate limit:** 110 requests / 10 seconds for HubSpot
- **Sequence enrollment limit:** 1,000 per portal inbox per day
