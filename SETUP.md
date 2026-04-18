# Setup Guide

How to get this workspace running on a new machine (e.g., Tim's).

---

## 1. Clone

```bash
git clone https://github.com/rdexel/ares-agent.git
cd ares-agent
```

---

## 2. Install dependencies

Two Node projects live here — the root (for scripts in `scripts/`) and the embedded Gmail MCP server.

```bash
# Root — for scripts/meeting-briefs.js, scripts/replied-followups.js
npm install

# Gmail MCP — for the Gmail MCP server
cd gmail-mcp
npm install
cd ..
```

Requires Node 18+.

---

## 3. Create `.mcp.json`

```bash
cp .mcp.json.template .mcp.json
```

Open `.mcp.json` and fill in:

### a) Gmail MCP path

Replace `/ABSOLUTE/PATH/TO/Hubspot/gmail-mcp/src/server.ts` with the absolute path on your machine — e.g., `/Users/tim/work/ares-agent/gmail-mcp/src/server.ts`.

### b) Google OAuth credentials (Drive + Calendar)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create or select a project.
2. Enable **Gmail API**, **Google Drive API**, and **Google Calendar API**.
3. Configure the **OAuth consent screen** (External, add yourself as test user, scopes: `gmail.readonly`, `gmail.modify`, `gmail.send`, `gmail.compose`, `drive`, `calendar`).
4. Create OAuth credentials (Desktop app) → download the JSON.
5. Save it somewhere outside the repo (e.g., `~/credentials/google-oauth.json`).
6. Update the absolute paths in `.mcp.json` for `GDRIVE_OAUTH_PATH` and `GOOGLE_OAUTH_CREDENTIALS` — both point to the same credentials file.
7. Token paths default to `~/.config/google-drive-mcp/tokens.json` and `~/.config/google-calendar-mcp/tokens.json`. These files will be created on first auth.

### c) HubSpot Private App token

1. In HubSpot: Settings → Integrations → Private Apps → Create a private app.
2. Give it scopes for CRM (contacts, deals, companies, associations, properties, tasks, meetings, emails), Sequences (enrollments), and Lists.
3. Copy the access token.
4. Paste into `.mcp.json` replacing `YOUR_HUBSPOT_PRIVATE_APP_TOKEN`.

Also export it for the Node scripts:

```bash
export HUBSPOT_ACCESS_TOKEN="pat-na2-..."
export HUBSPOT_API_KEY="$HUBSPOT_ACCESS_TOKEN"   # same token, used by runbooks
```

Add to your shell profile (`~/.zshrc` or `~/.bashrc`) so it persists.

### d) Anthropic API key (for scripts/meeting-briefs.js)

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

---

## 4. Configure Gmail MCP accounts

```bash
cd gmail-mcp
cp accounts.example.json accounts.json
```

Edit `accounts.json`:

```json
{
  "accounts": [
    { "email": "raleigh@socratics.ai", "alias": "raleigh" },
    { "email": "tim@socratics.ai",     "alias": "tim" }
  ],
  "default": "raleigh"
}
```

Place the Google OAuth `credentials.json` (same one used for Drive/Calendar above) in `gmail-mcp/` — or update the Gmail MCP code if you prefer a different path.

Authenticate each account (opens browser):

```bash
npm run auth
```

Tokens save to `gmail-mcp/tokens/`.

Authenticate Drive + Calendar the same way (run their auth commands as documented in the official MCP docs):

```bash
# Google Drive
GDRIVE_OAUTH_PATH=/ABSOLUTE/PATH/TO/credentials.json npx @modelcontextprotocol/server-gdrive auth

# Google Calendar
npx @cocal/google-calendar-mcp auth
```

---

## 5. Start Claude Code

From the repo root:

```bash
claude
```

Claude Code reads `.mcp.json` automatically. All configured MCPs should show up.

First message: `whoami` — if it responds as **Ares, the GTM operator for Socratics.ai**, everything is wired up.

---

## 6. Sanity checks

Ask Ares:

- `what tools do you have access to?` — should list Gmail, Drive, Calendar, HubSpot, Fetch.
- `pull open tasks for tim` — should return a TSV of Tim's open HubSpot tasks.
- `what's in my inbox` — should read recent emails from the configured default inbox.

If any fail, check `.mcp.json` paths and re-run the relevant auth flow.

---

## Files in this repo

- **`CLAUDE.md`** — orientation for Claude. Read first.
- **`company/`** — Socratics positioning, product, team, quarter (4-layer Ares memory, layer 1)
- **`accounts/`** — one file per account, canonical record (layer 2)
- **`campaigns/`** — motions in flight (layer 3)
- **`playbooks/`** — extracted patterns, voice guides (layer 4)
- **`operations/`** — runbooks for recurring work
- **`reference/`** — stable lookups (HubSpot IDs, tools, links)
- **`scripts/`** — Node scripts (meeting briefs, replied follow-ups)
- **`gmail-mcp/`** — Gmail MCP server source (separate Node project)
- **`archive/`** — closed work, old meeting notes

See `README.md` and `CLAUDE.md` for the full picture.

---

## Not in the repo (you'll need to provide)

- `.mcp.json` — live MCP config with tokens and paths (use `.mcp.json.template`)
- `credentials.json` — Google OAuth credentials file
- `gmail-mcp/accounts.json` — your Gmail account list (use `accounts.example.json`)
- `gmail-mcp/tokens/` — OAuth tokens (created by auth flow)
- `node_modules/` — run `npm install`
- `state/contact-monitor.json` — created on first contact-monitor run
- `.claude/` — Claude Code's local settings (per-user)
