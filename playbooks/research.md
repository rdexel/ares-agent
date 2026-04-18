# Research Playbook — Deal Attribution

For cold outreach. The #1 output of research is **deal-to-person attribution** — finding a specific deal, portfolio company, or transaction the contact has personally worked on. This is what powers the subject line and opener.

**We do not research personal details.** Career history, education, previous firms, LinkedIn posts, personal facts — none of that goes into the email. The only personalization that matters is the deal reference.

---

## Priority order

1. **Deal team attribution** — contact named on a deal page, press release, or portfolio company page.
2. **Board seat / board observer** — contact sits on the board of a portfolio company.
3. **Published investment thesis** — contact authored a public write-up about an investment.
4. **LinkedIn deal announcement** — contact posted or was tagged in a deal close.
5. **Firm-level fallback** — firm's most recent or most notable deal.

Personal attribution always beats firm-level fallback. Firm-level is acceptable but less powerful.

---

## Where to look (in order)

### Company portfolio pages — BEST SOURCE

Most PE firms list "deal team" or "portfolio team" members on each investment page:
```
https://<domain>/investment/<portfolio-company>/
https://<domain>/portfolio/<portfolio-company>/
```
Check every recent portfolio company page for team attribution.

### Company news pages

```
https://<domain>/news/
https://<domain>/press/
```
Usually has all recent announcements in one place.

### Company team pages

```
https://<domain>/team/
https://<domain>/team/<contact-name>/
https://<domain>/employee/<contact-name>/
```

**Known URL shortcuts (discovered across runs):**

| Firm | Pattern | Notes |
|------|---------|-------|
| Sterling Group | `/team/` | Lists portfolio company attributions per person — one fetch gets all contacts |
| Altamont | `/employee/<name>/` | `/team/all/` lists everyone but has NO deal attribution. Go straight to individual bio pages |
| Crestview | `/team/<name>` | Main `/firm` and `/team` pages don't render names — fetch individual slugs |

### Web search (targeted)

```
"<Company Name>" deal acquisition investment 2025 2026
"<First Last>" "<Company Name>" deal OR acquisition OR investment
"<First Last>" "<Portfolio Company Name>"
```

### LinkedIn (deal announcements only)

```
"<First Last>" "<Company Name>" site:linkedin.com
```
Look ONLY for deal-related posts. Ignore career history. WebFetch rarely renders LinkedIn content usefully — prefer web search results.

### What NOT to waste time on

- Press releases for VP-level attribution — they almost never name VPs, only MDs/Partners.
- Full LinkedIn profile fetches — rarely render useful content via WebFetch.
- Non-deal bio details — not used in the email.

---

## Deal type identification (critical for email opener)

Every returned deal MUST include a deal-type descriptor. A bare deal name without context is useless.

| Type | When |
|------|------|
| acquisition | Firm bought a company |
| sale | Firm sold / exited a company |
| exit | Successful sale / IPO |
| investment | Equity or follow-on investment |
| platform investment | New platform co in a roll-up strategy |
| add-on | Tuck-in acquisition to an existing platform |
| recapitalization | Financial restructuring / partial exit |
| mandate | IB advisory engagement |
| sell-side | IB mandate on the seller's side |
| IPO | Public offering |
| close | Generic safe fallback |
| deal | Safest fallback if type is unknown |

---

## Role filtering (do this BEFORE research)

Filter contacts out by title BEFORE spending research budget on them:

**Filter OUT:**
- Assistant, executive assistant, administrative
- Compliance, HR, human resources
- Marketing director, finance director, controller
- Chief of staff, director of operations, CFO (non-investment)
- Legal, membership, education director
- Industry affairs, investor relations
- Chief talent, chief value officer
- Accounting, organizational development, director of finance

**Keep:**
- Analysts, Associates, Senior Associates
- VPs (investment team), Principals
- Directors, MDs, Partners, Managing Directors
- Investors, Operating Partners (if investment-adjacent)

**Known always-filter contacts (from prior runs):**
- Alex Mardirossian (Crestview) — IR role
- Jyot Chadha (Altamont) — VP Finance

---

## Research quality tiers

| Quality | Description |
|---------|-------------|
| ✅ Strong | Contact personally named on deal team page or press release |
| ✅ Good | Contact has board seat at portfolio co or authored investment thesis |
| ⚠️ Acceptable | Firm-level deal used as fallback (no personal attribution) |
| ❌ Unusable | No recent deals for the firm at all — use problem-led subject line |

---

## Output format

Pass this combined brief to the email-writing step:

```json
{
  "company": {
    "name": "Clearview Capital",
    "website": "clearviewcap.com",
    "hook": "Recapitalized Advantage Behavioral Health in April 2025 (Fund V)",
    "hook_source": "https://clearviewcap.com/investment/advantage-behavioral-health/",
    "hook_type": "deal",
    "recent_deals": [
      "Advantage Behavioral Health (Apr 2025)",
      "Loss Prevention Services (Jan 2025)",
      "UpSwell / Taradel add-on (Feb 2025)"
    ],
    "fallback": "Lower-middle market PE firm actively deploying $850M Fund V"
  },
  "contacts": [
    {
      "name": "Kevin Pickens",
      "title": "Vice President",
      "email": "kpickens@clearviewcap.com",
      "deal_attribution": "Advantage Behavioral Health (deal team), UpSwell/Taradel (deal team)",
      "attribution_type": "deal team",
      "attribution_source": "https://clearviewcap.com/investment/advantage-behavioral-health/",
      "deal_type": "recapitalization"
    }
  ]
}
```

`deal_attribution` drives the email subject line. `attribution_type` tells the writer how strong the reference is. `deal_type` goes into the opener so the reader knows what the deal name refers to.

---

## Never fabricate

If you can't find an attribution, mark `Attribution Type: firm-level fallback` or `NONE`. Do not make up deal teams. A generic email without a real hook is worse than no email.
