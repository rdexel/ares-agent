# HubSpot Cold Outreach Agent

This folder contains the full instruction set for an AI agent that pulls cold leads from
HubSpot, researches each company and contact, and prepares personalized first-touch emails
written in Raleigh's voice.

---

## Folder Structure

```
hubspot-agent/
├── README.md                        ← You are here. Start here.
├── AGENT.md                         ← Main agent instruction file
├── skills/
│   ├── hubspot-data-pull.md         ← Step 1: Pull companies + contacts from HubSpot
│   ├── research-campaign.md         ← Step 2: Research each company and contact
│   └── raleigh-email-style.md       ← Step 3: Write emails in Raleigh's voice
```

---

## How to Run a Campaign

1. Tell the agent which **HubSpot list/segment** to pull from and **how many companies** to target
2. The agent runs all three steps automatically (pull → research → draft)
3. You receive a structured output: one email per contact, ready to paste into HubSpot sequences

---

## Prerequisites

- HubSpot API key (private app token) set as `HUBSPOT_API_KEY` environment variable
- Web access for LinkedIn and company website research
- The agent must read all three skill files in `skills/` before starting
