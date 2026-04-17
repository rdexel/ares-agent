# MCP Tool Reference

Quick-reference for all MCP tools available in this workspace. Use this to pick the right tool fast.

---

## Gmail MCP (`mcp__gmail__*`)

Multi-account Gmail integration. Accounts configured in `../advanced-gmail-mcp/accounts.json`.

**Accounts:**
| Alias | Email | Use for |
|-------|-------|---------|
| `raleigh` (default) | raleigh@socratics.ai | GTM outreach, prospect replies, Raleigh's inbox |
| `tim` | tim@socratics.ai | CEO inbox, investor/partner comms, BD |

### Reading & Searching

| Tool | What it does | Key params |
|------|-------------|------------|
| `list_emails` | List inbox emails with filters | `account`, `query` (Gmail syntax), `max_results`, `label` |
| `search_emails` | Search across all mail | `account`, `query` (required), `max_results` |
| `read_email` | Full email content by message ID | `account`, `message_id`, `format` (full/metadata/minimal) |
| `get_thread` | Full thread by thread ID | `account`, `thread_id` |
| `get_labels` | List all labels with counts | `account` |

**Gmail query syntax cheatsheet:**
- `is:unread in:inbox` — unread inbox
- `from:someone@example.com` — from specific sender
- `in:sent` — sent mail
- `newer_than:1d` — last 24 hours
- `-category:updates -category:promotions` — skip noise
- `subject:"keyword"` — subject line search
- `has:attachment` — emails with attachments

### Composing & Sending

| Tool | What it does | Key params |
|------|-------------|------------|
| `draft_email` | Create new draft | `account`, `to`, `subject`, `body`, `cc`, `bcc`, `is_html` |
| `draft_reply` | Draft reply to existing email | `account`, `message_id`, `body`, `reply_all`, `cc` |
| `send_email` | Send immediately (no draft) | `account`, `to`, `subject`, `body`, `cc`, `bcc` |
| `reply_email` | Reply immediately (no draft) | `account`, `message_id`, `body`, `reply_all`, `cc` |
| `send_draft` | Send an existing draft | `account`, `draft_id` |

**Workflow:** For anything going to prospects, always `draft_reply`/`draft_email` first, then let Raleigh review in Gmail before `send_draft`.

### Organizing

| Tool | What it does | Key params |
|------|-------------|------------|
| `archive_email` | Remove INBOX label | `account`, `message_id` |
| `trash_email` | Move to trash | `account`, `message_id` |
| `label_email` | Add/remove labels | `account`, `message_id`, `add_labels[]`, `remove_labels[]` |
| `batch_modify` | Bulk archive/trash/label | `account`, `message_ids[]`, `action` (archive/trash/label) |

---

## HubSpot Dev MCP (`mcp__HubSpotDev__*`)

HubSpot developer platform tools. Mostly for CMS/project management, NOT for CRM API calls. CRM API calls (contacts, deals, tasks, sequences) go through curl with `$HUBSPOT_API_KEY`.

### Docs & Research

| Tool | What it does | When to use |
|------|-------------|-------------|
| `search-docs` | Search HubSpot dev docs | Before writing any HubSpot integration code |
| `fetch-doc` | Fetch full doc page by URL | After search-docs, to get authoritative content |

### Project Management

| Tool | What it does | When to use |
|------|-------------|-------------|
| `create-project` | Create new HubSpot project | New app/integration scaffolding |
| `upload-project` | Upload project to HubSpot | DESTRUCTIVE — only when explicitly asked |
| `deploy-project` | Deploy a build | Only when explicitly asked |
| `validate-project` | Validate project config | Before upload, checking for issues |
| `get-build-status` | Check recent build status | Debugging failed builds |
| `get-build-logs` | Full build pipeline logs | Deep debugging after get-build-status |

### CMS Tools

| Tool | What it does |
|------|-------------|
| `create-cms-function` | Create serverless function |
| `create-cms-module` | Create HubL or React module |
| `create-cms-template` | Create page/email/blog template |
| `list-cms-remote-contents` | List remote CMS directory |
| `list-cms-serverless-functions` | List deployed functions |
| `get-cms-serverless-function-logs` | Read function logs |

### App Management

| Tool | What it does |
|------|-------------|
| `add-feature-to-project` | Add card/webhook/workflow-action/etc to project |
| `create-test-account` | Create dev test portal |
| `get-applications-info` | List all apps in account |
| `get-api-usage-patterns-by-app-id` | API usage analytics per app |
| `get-feature-config-schema` | JSON schema for hsmeta.json features |
| `guided-walkthrough-cli` | Interactive CLI walkthrough |

---

## HubSpot CRM API (via curl + $HUBSPOT_API_KEY)

These are NOT MCP tools — they're direct API calls used by the skills in this project.

**Auth:** `Authorization: Bearer $HUBSPOT_API_KEY`
**Base URL:** `https://api.hubapi.com`
**Rate limit:** 110 requests / 10 seconds. Batch endpoints count as 1 call.
**Implementation:** Always use curl, write to temp files, process in Python. Never embed JSON in shell vars.

### Common Endpoints

| Endpoint | Method | Use |
|----------|--------|-----|
| `/crm/v3/objects/contacts/search` | POST | Search/filter contacts |
| `/crm/v3/objects/contacts/batch/read` | POST | Batch read contact properties (up to 100) |
| `/crm/v3/objects/deals/search` | POST | Search/filter deals |
| `/crm/v3/objects/tasks/search` | POST | Search tasks by owner/status/type |
| `/crm/v3/objects/emails/search` | POST | Search email engagements |
| `/crm/v3/objects/meetings/search` | POST | Search meetings |
| `/crm/v3/objects/companies/batch/read` | POST | Batch read company names |
| `/crm/v3/lists/{listId}/memberships` | GET | Get list members (paginate with ?after=) |
| `/crm/v3/lists/search` | POST | Find list by name |
| `/crm/v3/objects/contacts/{id}` | PATCH | Update contact properties |
| `/crm/v3/objects/{type}/{id}/associations/{toType}` | GET | Get associations |
| `/automation/sequences/2026-03/enrollments` | POST | Enroll contact in sequence |

### Known IDs

**Owners:**
| Email | ID | Name |
|-------|-----|------|
| timeun@gmail.com | 161538153 | Tim Eun |
| raleigh@socratics.ai | 161977243 | Raleigh Dexel |

**Lists:**
| List | ID | Type |
|------|-----|------|
| Deal Analyst - IB/PE | 14 | Contact (0-1) |
| Deal Reviewer - IB/PE | 15 | Contact (0-1) |
| IC Buyer - PE/IB | 16 | Contact (0-1) |
| Pre Launch Interest | 23 | Snapshot |
| Replied | 58 | Dynamic |

**Sequences:**
| Sequence | ID | Maps to List |
|----------|-----|-------------|
| Deal Analyst Sequence | 558893796 | 14 |
| Deal Reviewer Sequence | 558893799 | 15 |
| IC Buyer Sequence | 559020782 | 16 |

**Pipeline Stages:**
| ID | Name |
|----|------|
| 3394403052 | Demo Interest |
| appointmentscheduled | Demo Scheduled |
| 3380746945 | Initial Demo |
| 3381702384 | Second Demo |
| qualifiedtobuy | Trial/Testing |
| presentationscheduled | Presentation Scheduled |
| decisionmakerboughtin | Decision Maker Bought-In |
| contractsent | Contract Sent |
| closedwon | Closed Won |
| closedlost | Closed Lost |

**Sender Config (cold outreach):**
| Field | Value |
|-------|-------|
| senderEmail | raleigh@socratics.ai |
| senderAliasAddress | tim.ceo@socratics.io |
| userId | 161977243 |

**Custom Contact Properties (for sequence personalization):**
`socratics_deal_hook`, `socratics_deal_type`, `socratics_email_subject`, `socratics_email_opener`, `socratics_email_body`, `socratics_email_cta`, `socratics_company_team`

---

## Key Links

| Resource | URL |
|----------|-----|
| Raleigh's Calendar | https://meetings-na2.hubspot.com/raleigh-dexel |
| Tim's Calendar | https://meetings-na2.hubspot.com/tim-eun |
| Platform Signup | https://app.socratics.ai |
| Notion Guides | https://socratics.notion.site/Guides-2d13c45d6b8480888a0ee2ece04516b9 |
