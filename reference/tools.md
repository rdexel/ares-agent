# Tools — MCP Inventory

What's available, what each tool does, and when to reach for it. Don't announce which tool you're using — just use it. Compose freely across them.

Prefer internal sources of truth (HubSpot, Drive) over the web when both exist. When tools conflict, trust the most recent human-entered data and flag the discrepancy.

---

## Gmail (`mcp__gmail__*`)

Multi-account Gmail. Accounts:

| Alias | Email | Use |
|-------|-------|-----|
| `raleigh` (default) | raleigh@socratics.ai | GTM outreach, Raleigh's outbound |
| `tim` | tim@socratics.ai | CEO inbox, investor/partner/BD |

### Reading

| Tool | Key params |
|------|-----------|
| `list_emails` | `account`, `query`, `max_results`, `label` |
| `search_emails` | `account`, `query` (required), `max_results` |
| `read_email` | `account`, `message_id`, `format` |
| `get_thread` | `account`, `thread_id` |
| `get_labels` | `account` |

**Gmail query cheatsheet:**
- `is:unread in:inbox`
- `from:someone@example.com`
- `in:sent`
- `newer_than:1d`
- `-category:updates -category:promotions`
- `subject:"keyword"`
- `has:attachment`

### Composing

| Tool | What |
|------|------|
| `draft_email` | Create new draft |
| `draft_reply` | Draft reply to existing email |
| `send_email` | Send immediately (no draft) |
| `reply_email` | Reply immediately |
| `send_draft` | Send existing draft |

**Always draft first for prospect-facing emails.** Raleigh reviews in Gmail before sending.

### Organizing

| Tool | What |
|------|------|
| `archive_email` | Remove INBOX label |
| `trash_email` | Move to trash |
| `label_email` | Add/remove labels |
| `batch_modify` | Bulk archive/trash/label |

---

## HubSpot CRM (`mcp__hubspot__*`)

Structured CRM operations through the MCP layer. For anything the MCP doesn't cover (or for batch ops where curl is simpler), use direct API calls — see [hubspot.md](hubspot.md).

Available MCP tools:

| Tool | What |
|------|------|
| `hubspot-list-objects` | List contacts, deals, companies, etc. |
| `hubspot-search-objects` | Search with filters |
| `hubspot-batch-read-objects` | Batch read by IDs |
| `hubspot-batch-create-objects` | Batch create |
| `hubspot-batch-update-objects` | Batch update |
| `hubspot-batch-create-associations` | Link objects |
| `hubspot-list-associations` | Read associations |
| `hubspot-get-association-definitions` | Schema for associations |
| `hubspot-list-properties` | List properties on an object type |
| `hubspot-get-property` | Single property details |
| `hubspot-create-property` | Create a custom property |
| `hubspot-update-property` | Update a custom property |
| `hubspot-get-schemas` | Object schemas |
| `hubspot-list-workflows` | Workflows |
| `hubspot-get-workflow` | Workflow details |
| `hubspot-create-engagement` | Log a call/email/note engagement |
| `hubspot-get-engagement` | Read an engagement |
| `hubspot-update-engagement` | Update an engagement |
| `hubspot-get-link` | CRM URL builder |
| `hubspot-get-user-details` | Current user / portal info |
| `hubspot-generate-feedback-link` | Feedback URL |

**When to use MCP vs. curl:**
- MCP: small single-record ops, property management, workflows
- curl: sequence enrollments, large batch pulls, custom filters, anything that needs a temp-file intermediate

---

## HubSpot Dev (`mcp__HubSpotDev__*`)

Developer platform tools. **NOT for CRM API calls** (use the CRM tools or curl instead). Use these for CMS / project / app management.

### Docs
- `search-docs`, `fetch-doc`

### Project management
- `create-project`, `upload-project`, `deploy-project`, `validate-project`
- `get-build-status`, `get-build-logs`

### CMS
- `create-cms-function`, `create-cms-module`, `create-cms-template`
- `list-cms-remote-contents`, `list-cms-serverless-functions`, `get-cms-serverless-function-logs`

### App management
- `add-feature-to-project`, `create-test-account`
- `get-applications-info`, `get-api-usage-patterns-by-app-id`
- `get-feature-config-schema`, `guided-walkthrough-cli`

---

## Google Drive (`mcp__google-drive__*` + `mcp__claude_ai_Google_Drive__*`)

Drive files, Docs, Sheets, Slides. OAuth2 auth.

**Tokens:** `~/.config/google-drive-mcp/tokens.json` (Raleigh authenticated 2026-04-18). Tim's Drive is NOT yet authenticated.

| Tool | What |
|------|------|
| `search_files` / `search` | Search by name / type / content |
| `read_file_content` | Read a file by ID or path |
| `download_file_content` | Binary download |
| `get_file_metadata` | File metadata |
| `get_file_permissions` | Permissions |
| `list_recent_files` | Most recent |
| `create_file` | Create Docs / Sheets / etc. |

---

## Google Calendar (`mcp__google-calendar__*`)

Full calendar read/write. Tokens at `~/.config/google-calendar-mcp/tokens.json` (Raleigh authenticated 2026-04-18). Tim's calendar not yet authenticated — run `npx @cocal/google-calendar-mcp auth tim` to add.

| Tool | What |
|------|------|
| `list-events` | Upcoming events with date filters |
| `search-events` | Find events by text |
| `get-event` | Event details |
| `create-event` / `create-events` | Add events |
| `update-event` | Modify |
| `delete-event` | Remove |
| `get-freebusy` | Availability windows |
| `list-calendars` | All calendars |
| `list-colors` | Event colors |
| `respond-to-event` | Accept / decline / tentative |
| `manage-accounts` | Add / switch accounts |
| `get-current-time` | Now |

Use for: auto-prep meeting briefs, daily-report calendar context, upcoming client calls, free/busy checks before suggesting times.

---

## Fetch (`mcp__fetch__fetch`)

Raw HTTP fetching for arbitrary URLs. Use for research when WebFetch isn't enough (e.g., custom headers, non-HTML endpoints).

---

## Scheduling / automation (builtin)

| Tool | What |
|------|------|
| `CronCreate` / `CronDelete` / `CronList` | Scheduled remote triggers |
| `RemoteTrigger` | Fire a trigger manually |
| `ScheduleWakeup` | Self-paced loop tick |
| `Monitor` | Stream events from a background process |
| `TaskOutput` / `TaskStop` | Manage background agents |

---

## Core tools (always available)

Read, Edit, Write, Glob, Grep, Bash, Agent, WebFetch, WebSearch, TodoWrite.

Use dedicated tools over Bash when one fits. Bash only for shell-only operations.
