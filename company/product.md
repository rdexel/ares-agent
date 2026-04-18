# Socratics — Product

## Versions in flight

| Version | Status | What it is |
|---------|--------|-----------|
| **v1 (alpha)** | Live | Initial platform. Functional but rough. Self-serve onboarding is the weak link. |
| **v2** | Rapidly prototyping | Fuller suite: **Socratics Compose** (multi-document financial statement consolidation) + **Socratics Model** (full modeling surface). Functional prototypes users can test with their own data today. |

The sell this quarter is the trajectory — v1 gets them in, v2 prototypes keep them engaged. See [quarter.md](quarter.md) for the reference-customer motion.

## Surface area

Platform that ingests raw, messy financial source data and produces institutional-grade, formula-linked 3-statement models with full audit trails.

**What it does well:**
- Structures raw financials into clean, consistent schemas
- Builds formula-linked income statement, balance sheet, and cash flow statements
- Surfaces every assumption and traces every number
- Works on messy, multi-format inputs (P&L-only, multi-year flat files, etc.)

**Modules:**
- **Core ingestion** — single XLSX with bucketing and validation
- **Socratics Compose** (v2) — multi-document financial statement consolidation
- **Socratics Model** (v2) — full modeling suite
- **CIM-to-Excel parser** — extracts financials from CIM PDFs via agents

**Known rough edges (as of 2026-04-18):**
- v1 is "okay, not great" — onboarding friction is the biggest blocker to trials.
- P&L-only upload without a balance sheet causes a spin / unclear error. Engineering surfacing a clearer error message is an open task (flagged in Turtleback Partners meeting 2026-04-17).
- Sector-specific data taxonomies are in-progress. Oil & gas / energy is a candidate design-partner expansion (Turtleback Partners, James Edwards).

## Key URLs

| Resource | URL |
|----------|-----|
| Platform | https://app.socratics.ai |
| Raleigh's calendar | https://meetings-na2.hubspot.com/raleigh-dexel |
| Tim's calendar | https://meetings-na2.hubspot.com/tim-eun |
| Notion user guides | https://socratics.notion.site/Guides-2d13c45d6b8480888a0ee2ece04516b9 |

## What to send a prospect

| Stage | Send |
|-------|------|
| First touch (cold) | No links. Voice-only. |
| Warm follow-up / referral | Calendar link |
| Access request | Platform signup URL + Notion guides |
| Trial / design partnership | Trial agreement + NDA + data retention policy |

## What we don't do (yet)

- Not a prosumer tool — quality institutional product
- Not a general-purpose AI — purpose-built for private capital
- Not black-box — every number is traceable
