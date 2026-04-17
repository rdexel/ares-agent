# Skill: Research Campaign

For each company and contact pulled from HubSpot, gather intelligence to make
outreach emails specific, timely, and relevant. This step is what separates a
personalized email from a template blast.

---

## Research Priority Order

Do company research first — it powers the subject line and opening hook.
Do contact research second — it personalizes the email body or greeting.

---

## Company Research

### Goal
Find one recent, specific, verifiable event that can be referenced in the subject line
or opening line. The best hooks are things the prospect is proud of and will recognize
immediately.

### What to Look For (in order of preference)

1. **Recent deal activity** — new fund close, acquisition, new portfolio company added,
   exit/sale announcement, investment announcement
2. **Firm news** — new office opening, leadership hire, rebrand, expansion into new sector
3. **Market activity** — public commentary on a deal or sector they're active in
4. **Content they've published** — recent article, podcast appearance, panel participation

### Where to Look

**Company website:**
```
https://<company_domain>
https://<company_domain>/news
https://<company_domain>/portfolio
https://<company_domain>/press
```

**LinkedIn company page:**
```
https://www.linkedin.com/company/<company-slug>/posts/
```
Look at the last 3–5 posts for deal announcements, team news, or portfolio updates.

**Web search:**
```
"<Company Name>" deal OR acquisition OR fund OR investment site:prnewswire.com OR businesswire.com OR globenewswire.com
"<Company Name>" PE fund announcement 2025
```

### Output — Company Research Brief

```
Company: [Name]
Website: [URL]
Recent Hook: [One sentence description of the findable recent event]
Hook Source: [URL where you found it]
Hook Type: [deal / fund close / hire / news / content]
Hook Date: [Approximate date if visible]
Fallback: [If no hook found — describe their stated focus area for a problem-led open]
```

**If no hook is found after searching website + LinkedIn + web:**
Mark `Recent Hook: NONE` and use the `Fallback` field instead. Do not fabricate.

---

## Contact Research — Deal Attribution (MOST IMPORTANT STEP)

### Goal
Find a specific deal, portfolio company, or transaction that the contact has personally
been involved with. This is the single most important research output. The deal name goes
directly into the email subject line.

**Do NOT research personal details.** We do not use career background, education, previous
firms, LinkedIn posts, or personal facts in the email. The only personalization that matters
is the deal reference.

### What to Look For (in order of preference)

1. **Deal team attribution** — the contact is named on a deal page, press release, or
   portfolio company page as part of the team that worked the deal
2. **Board seat or board observer role** — the contact sits on the board of a portfolio company
3. **Published investment thesis** — the contact authored or co-authored a public write-up
   about why the firm invested in a specific company
4. **LinkedIn deal announcement** — the contact posted about or was tagged in a deal close
5. **Firm-level deal (fallback)** — if no personal attribution is found, use the firm's
   most recent or most notable deal

### Where to Look

**Company portfolio pages (BEST SOURCE):**
Many PE firm websites list "deal team" or "portfolio team" members on each investment page.
```
https://<company_domain>/investment/<portfolio-company-name>/
https://<company_domain>/portfolio/<portfolio-company-name>/
```
Check every recent portfolio company page for team attribution.

**Individual bio pages:**
```
https://<company_domain>/employee/<contact-name>/
https://<company_domain>/team/<contact-name>/
```
Some firms list portfolio companies the person is involved with on their bio.

**Press releases and news:**
```
"<First Last>" "<Company Name>" deal OR acquisition OR investment
"<First Last>" "<Portfolio Company Name>"
```

**LinkedIn (deal announcements only):**
```
"<First Last>" "<Company Name>" site:linkedin.com
```
Look ONLY for deal-related posts. Ignore career history and personal content.

### Output — Contact Deal Attribution

```
Contact: [Name] — [Title]
Deal Attribution: [Specific deal/portfolio company they are tied to]
Attribution Type: [deal team / board seat / authored thesis / firm-level fallback]
Source: [URL]
```

### Fallback When No Personal Attribution Exists

If no personal deal attribution is found after checking portfolio pages, bios, press
releases, and LinkedIn:
- Use the firm's most recent deal announcement
- Mark `Attribution Type: firm-level fallback`
- This is acceptable but less powerful than personal attribution

---

## Research Quality Standards

| Quality | Description |
|---|---|
| ✅ Strong | Contact personally named on deal team page or press release |
| ✅ Good | Contact has board seat at portfolio co or authored investment thesis |
| ⚠️ Acceptable | Firm-level deal used as fallback (no personal attribution found) |
| ❌ Unusable | No recent deals found for the firm at all — use problem-led subject line |

---

## Research Scope Per Run

- Spend **most of your research budget on deal attribution.** This is the highest-value output.
- For each company: check homepage, news page, portfolio pages (3–5 requests)
- For deal attribution: check each portfolio company's deal page for team listings (1–2
  requests per recent deal)
- For individual contacts: check their bio page on the firm website (1 request each)
- Web search for contact + deal names only if bio pages don't have attribution (1–2 requests)
- Do not research personal details, career history, or education. That data is not used.

---

## Output to Pass to Email Writing Step

For each company + contacts, pass this combined brief:

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
      "attribution_source": "https://clearviewcap.com/investment/advantage-behavioral-health/"
    },
    {
      "name": "Peter DaGiau",
      "title": "Associate",
      "email": "pdagiau@clearviewcap.com",
      "deal_attribution": "The Barcode Group (deal team)",
      "attribution_type": "deal team",
      "attribution_source": "https://clearviewcap.com/investment/the-barcode-group-inc/"
    },
    {
      "name": "Richard Niu",
      "title": "Associate",
      "email": "rniu@altamontcapital.com",
      "deal_attribution": "Key Container Corporation (firm-level, March 2026)",
      "attribution_type": "firm-level fallback",
      "attribution_source": "https://altamontcapital.com/news/"
    }
  ]
}
```

**Note:** The `deal_attribution` field is what drives the email subject line. The
`attribution_type` tells the email writer how strong the reference is. Personal deal team
attribution is always preferred over firm-level fallback.
