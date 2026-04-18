# Ares — Socratics GTM Workspace

Operator workspace for **Ares**, the GTM agent for Socratics.ai. Serves Raleigh (Head of GTM) and Tim (CEO).

Orientation file for Claude: [CLAUDE.md](CLAUDE.md).

## Four-layer memory

| Layer | Directory |
|-------|-----------|
| Company (slow-changing) | [company/](company/) |
| Accounts (living record per account) | [accounts/](accounts/) |
| Campaigns (motions in flight) | [campaigns/](campaigns/) |
| Playbooks (extracted patterns) | [playbooks/](playbooks/) |

## Supporting

| Directory | Purpose |
|-----------|---------|
| [operations/](operations/) | How-to-execute runbooks |
| [reference/](reference/) | Stable lookups — HubSpot IDs, API patterns, tools, links |
| [scripts/](scripts/) | Executable code |
| [state/](state/) | Mutable agent state |
| [archive/](archive/) | Closed-out campaigns, dead accounts, stale artifacts |
| [gmail-mcp/](gmail-mcp/) | Gmail MCP server source |

## Environment

Requires:

- `HUBSPOT_API_KEY` — private app token (CRM)
- `HUBSPOT_ACCESS_TOKEN` — for scripts in `scripts/`
- `ANTHROPIC_API_KEY` — for any script using Claude

MCP configuration in [.mcp.json](.mcp.json).
