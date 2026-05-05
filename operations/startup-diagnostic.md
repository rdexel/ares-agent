# Startup Diagnostic

Run this whenever Raleigh (or Tim) opens a session and asks you to start up, boot, introduce yourself, or otherwise signals "I'm here, are you working?" Triggers include:

- "start up" / "boot up" / "wake up"
- "introduce yourself" / "who are you" / "whoami"
- "ready?" / "are you online?"
- A bare "hi Ares" / "morning Ares" with no other request

If the message has any other actionable request, do the diagnostic *after* answering the request, not before — Raleigh's time matters more than ceremony.

---

## Procedure

### 1. Introduce yourself (1–2 lines)

Plain text. Match the tone in `~/.../memory/user_gtm_identity.md`. Example:

> Ares online. GTM operator for Socratics.ai. Running diagnostic.

No emojis. No "I'm excited to help."

### 2. Run the MCP diagnostic

Fire all six checks **in parallel** (single message, multiple tool calls). They are read-only, cheap, and independent.

| MCP | Diagnostic call | Pass = |
|-----|-----------------|--------|
| Gmail (raleigh) | `mcp__gmail__get_labels` with `account: "raleigh"` | Returns label list |
| Gmail (tim) | `mcp__gmail__get_labels` with `account: "tim"` | Returns label list |
| HubSpot CRM | `mcp__hubspot__hubspot-get-user-details` | Returns portal + user info |
| Google Drive | `mcp__google-drive__search` with a trivial query (e.g. `query: "Socratics"`, `pageSize: 1`) | Returns at least metadata, not auth error |
| Google Calendar | `mcp__google-calendar__get-current-time` | Returns timestamp |
| Fetch | (skip — no health endpoint, assume up if loaded) | — |

Hunter.io is not an MCP, so it's not part of this check. If Raleigh asks specifically, run `node scripts/hunter.js count socratics.ai` as a smoke test.

### 3. Report status

One compact block. Use `OK` / `FAIL` text labels — no emojis.

```
MCPs:
  Gmail (raleigh)   OK
  Gmail (tim)       OK
  HubSpot CRM       OK
  Google Drive      OK
  Google Calendar   OK
  Fetch             OK (assumed)
```

If everything passes, that's the whole report. Stop talking.

### 4. On failure — diagnose and suggest next steps

For each failing MCP, name the likely cause and the exact command to fix. Reference [../SETUP.md](../SETUP.md) where relevant.

Common failure modes:

| Symptom | Likely cause | Next step |
|---------|--------------|-----------|
| `auth` / `401` / `unauthorized` on Gmail | Token expired or never created | `cd gmail-mcp && npm run auth` (specify account if needed) |
| Gmail (tim) fails but raleigh works | Tim's account never authenticated | Authenticate Tim's Gmail per [../SETUP.md](../SETUP.md) §4 |
| `401` on HubSpot CRM | Private app token revoked or missing | Check `.mcp.json` HubSpot block; rotate token in HubSpot → Private Apps |
| Drive / Calendar `invalid_grant` or `auth required` | OAuth tokens expired | Re-run the auth command from [../SETUP.md](../SETUP.md) §4 (Drive: `GDRIVE_OAUTH_PATH=... npx @modelcontextprotocol/server-gdrive auth`; Calendar: `npx @cocal/google-calendar-mcp auth`) |
| Tool not registered at all (`No such tool`) | MCP server not loading | Check `.mcp.json` exists and has correct absolute paths; restart Claude Code |
| Generic network/timeout | Transient | Retry once. If still failing, flag it as transient and move on. |

If a failure blocks the work Raleigh is about to do, say so explicitly: "Calendar is down — meeting briefs and daily report will skip the calendar context until this is fixed."

If a failure is non-blocking for what Raleigh actually wants (e.g., Drive down but he's asking for cold outreach), note it in one line and proceed.

### 5. Don't loop

Run the diagnostic **once per session**. If Raleigh asks for status mid-session, re-run only what he names — don't re-fire the whole battery on every "hi."
