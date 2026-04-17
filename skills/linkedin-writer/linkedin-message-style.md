---
name: linkedin-message-style
description: >
  Write LinkedIn messages in Raleigh Dexel's voice for warm follow-up outreach.
  These contacts have already received and opened emails from Raleigh. The LinkedIn
  message is the next touchpoint in the sequence, sent from the CEO's (Tim Eun's)
  personal LinkedIn. The tone acknowledges prior contact and makes an assumptive
  ask for a demo. Use personalization tokens (deal names, company names) from the
  original email campaign.
---

# LinkedIn Message Style — Raleigh Dexel (Warm Follow-Up)

These LinkedIn messages are NOT cold outreach. The contact has already:
1. Received a cold email from Raleigh
2. Opened that email (confirmed by HubSpot tracking)
3. Not yet replied or booked a meeting

This LinkedIn message is **Tim Eun (CEO) reaching out on LinkedIn as the next
touchpoint.** The message should feel like a natural escalation: the company has
already been in touch, now the CEO is personally reaching out to get the demo on
the calendar.

**Always read `skills/email-writer/raleigh-email-style.md` first.** This file only
covers what's DIFFERENT for LinkedIn. All core voice rules (no exclamation points in
sales context, no hollow openers, no corporate buzzwords, no em-dashes, etc.) still apply.

---

## Context the Agent Must Gather

Before writing any message, the agent MUST retrieve:

1. **The original email subject line and deal hook** — so the LinkedIn message uses
   the same personalization token. The contact saw this in their inbox, so referencing
   it creates continuity.
2. **The contact's company name** — must appear in every message.
3. **The contact's title** — to calibrate tone (MD gets more direct, Associate gets
   slightly warmer).

To get the original email context, check HubSpot email engagement history:

```
POST https://api.hubapi.com/crm/v3/objects/emails/search
{
  "filterGroups": [{
    "filters": [
      {
        "propertyName": "hs_email_direction",
        "operator": "EQ",
        "value": "FORWARDED_EMAIL"
      },
      {
        "propertyName": "associations.contact",
        "operator": "EQ",
        "value": "<contactId>"
      }
    ]
  }],
  "properties": [
    "hs_email_subject", "hs_email_text", "hs_timestamp"
  ],
  "sorts": [{"propertyName": "hs_timestamp", "direction": "DESCENDING"}],
  "limit": 1
}
```

If the email history API doesn't return results, check the task body for context.
If neither has the original email details, use the deal hook from research as the
personalization token (same as the email-writer would have used).

---

## Message Tone & Framing

**This is NOT a repeat of the email.** The message should:

- **Tim introduces himself as CEO of Socratics** — every message must establish who
  he is. But the intro should flow directly into what Socratics does, not be a
  separate stiff line. "I'm Tim, CEO at Socratics. We build..." is one motion.
  The intro IS the pitch.
- **Acknowledge prior contact when natural** — "my team sent over some info on..."
  or "my team reached out about..." works well because it reinforces that Tim is
  the CEO following up on what his team started. But don't force it if the message
  flows better leading with the hook directly.
- **Be assumptive about the demo** — don't ask IF they want to see it, ask WHEN.
  The framing is: this is worth 15 minutes, let's find a time.
- **Use the same deal/company personalization token** from the email — this creates
  continuity and shows it's not a spray-and-pray campaign
- **The CEO weight matters** — the prospect got an email from a sales team member,
  now the CEO is reaching out personally. This signals the prospect is important
  to the company, not just a name on a list.

**The formula:**
1. Tim introduces himself as CEO of Socratics, flowing naturally into what the company does (1-2 sentences)
2. Connect it to the personalization token — deal name or company-specific hook (1 sentence)
3. Assumptive demo ask (1 sentence)

Tim's intro should NOT be a stiff "I'm Tim Eun, CEO of Socratics.ai." It should
flow naturally into the value prop: "I'm Tim, CEO at Socratics — we build..." or
"I run Socratics.ai, we're building..." The intro and the pitch are one motion.

---

## Message Formats

### Connection Request (300 character limit)

The primary format. Tim is connecting with someone who got Raleigh's email.

**Structure:**
1. Name + Tim introduces himself as CEO of Socratics, flowing into what the company does (1-2 sentences)
2. Connect to the deal/company personalization token (1 sentence)
3. Assumptive demo ask (1 sentence)

**Rules:**
- MUST be under 300 characters
- No greeting line — name inline
- No sign-off
- No links
- Company name must appear once
- Same deal/personalization token as the email they opened
- Tim introduces himself naturally — "I'm Tim, CEO at Socratics" or "I run Socratics.ai"
  should flow directly into the value prop, not stand alone as a stiff intro line
- Do NOT say "I saw you opened my email" or reference email tracking
- The intro + pitch should feel like one motion, not two separate statements

**Examples:**

*With deal attribution (strong):*
```
Derek, I'm Tim, CEO at Socratics. We build audit-ready financial models in under 10 minutes for PE teams. Curious how the ABH model buildout went at Clearview. When do you have 15 minutes for a demo?
```
(200 chars)

*Firm-level fallback:*
```
Michael, I run Socratics.ai, we're building institutional financial models in under 10 minutes specifically for IB teams. Would love to show the iMerge team how it works. When works for a quick demo?
```
(199 chars)

*Deal-question led:*
```
Jessica, I'm Tim, CEO at Socratics. We turn raw financials into audit-ready 3-statement models in under 10 minutes. Curious how the Cade team handles model builds on new deals. Worth 15 minutes?
```
(194 chars)

*Direct and short:*
```
Dan, I'm Tim from Socratics.ai. We help deal teams like Oaklins build financial models in under 10 minutes. Would love to show you what that looks like. When do you have 15 minutes?
```
(182 chars)

*Senior-level (MD/Partner — more direct):*
```
Harry, I'm Tim, I run Socratics.ai. We build audit-ready 3-statement models in under 10 minutes for teams like Lempriere Wells. Worth a quick demo?
```
(147 chars)

---

### InMail / Direct Message (600 character soft limit)

Used when Tim is already connected with the contact.

**Structure:**
1. Name + Tim introduces himself as CEO, flowing into what Socratics does (1-2 sentences)
2. Deal hook tied to their company + value prop detail (1-2 sentences)
3. Assumptive demo ask with company name (1 sentence)

**Rules:**
- Keep under 600 characters
- First name, no "Hi" needed
- No sign-off needed
- No links
- More room to flesh out the value prop than a connection request
- Tim's intro flows into the pitch — one motion
- Still assumptive — "when" not "if"

**Examples:**

*With deal attribution:*
```
Derek, I'm Tim, CEO at Socratics.ai. We build institutional-grade 3-statement models in under 10 minutes, specifically for PE teams. Formula-linked, fully traceable, every assumption visible.

If the ABH model build was anything like what we typically see, this would save the Clearview team a lot of hours. 200+ PE teams and banks use us to skip the rebuild and go straight to analysis.

When do you have 15 minutes for a quick demo?
```
(435 chars)

*Firm-level fallback:*
```
Michael, I run Socratics.ai. We build institutional financial models in under 10 minutes for IB and PE teams. Everything formula-linked, audit-ready, no black-box outputs.

200+ teams use us to skip the rebuild and go straight to analysis. Would love to show the iMerge team what this looks like. When works for 15 minutes?
```
(323 chars)

---

### Re-Engagement Message (400 character soft limit)

For contacts who opened the email a while ago but never engaged further. The LinkedIn
task may be a second or third follow-up attempt.

**Structure:**
1. Light, no-pressure acknowledgment (1 sentence)
2. Restate the hook briefly (1 sentence)
3. Open-ended CTA (1 sentence)

**Rules:**
- Keep under 400 characters
- Do NOT guilt-trip or reference how many times you've reached out
- Assume they're busy, not disinterested
- Softer CTA — "if the timing works" or "happy to set something up when it makes sense"
- Company name once

**Examples:**

*Casual re-engagement:*
```
Jas, I'm Tim, CEO at Socratics.ai. My team reached out a while back about financial modeling for the Lark Street team. If model builds are ever eating up more time than they should, happy to show you what we've built. No rush.
```
(226 chars)

*Brief and direct:*
```
Stephen, I'm Tim from Socratics.ai. My team sent over some info on faster financial modeling for Bay Advisory. If that's still relevant, happy to set up a quick demo whenever timing works.
```
(188 chars)

---

## Personalization Token Rules

The personalization token is the deal name, portfolio company, or firm name that
appeared in the original email subject line. It MUST carry over to the LinkedIn message.

**Priority order (same as email):**
1. Specific deal or portfolio company the contact is tied to
2. Firm's most recent notable deal
3. Company/firm name (always available as fallback)

**How to use the token in LinkedIn messages:**
- Weave it into the hook naturally: "modeling the ABH financials," "the Oaklins deal team,"
  "new deals at Cade"
- Do NOT repeat the exact email subject line verbatim — rephrase it
- The token should feel like you know their work, not like you're reading from a script

---

## LinkedIn vs. Email — Key Differences

| Dimension | Email (Cold) | LinkedIn (Warm Follow-Up) |
|---|---|---|
| Context | First touch, no prior contact | They opened the email, this is touch #2+ |
| Who sends | Raleigh | Tim (CEO) |
| Framing | "Here's what we do" | "Our team sent something over, wanted to connect personally" |
| CTA | Assumptive ask for call | Assumptive ask for demo |
| Subject line | Required, deal-hook-driven | None (connection request) or optional (InMail) |
| Greeting | "Hi [Name]," on own line | Name inline, no "Hi" |
| Sign-off | Always "Best," | None needed |
| Length | 4-6 sentences | 2-3 sentences (connection) or 3-5 (InMail) |
| Links | None in first touch | None |
| Tone | Casual-professional | Slightly warmer, CEO-personal |
| Explain socratics.ai | Yes, they don't know you | Brief — they've seen the email |

---

## Character Count Reference

Always count characters and report them. LinkedIn enforces these:

| Message Type | Hard Limit | Target |
|---|---|---|
| Connection request | 300 chars | Under 250 preferred |
| InMail subject | 200 chars | Under 60 (match email style) |
| InMail body | 1900 chars | Under 600 |
| Regular DM | 8000 chars | Under 400 |

---

## What NOT To Do

| Don't | Do instead |
|---|---|
| "I'm Tim Eun, CEO of Socratics.ai. I wanted to reach out..." | "I'm Tim, CEO at Socratics. We build..." (intro flows into pitch) |
| Stiff two-sentence intro then separate pitch | One motion: who I am + what we do in a single breath |
| "I saw you opened our email" | Reference the topic, not the tracking |
| "Just following up on Raleigh's email" | "My team sent over some info on..." or lead with the hook directly |
| Repeat the email word-for-word | Rephrase the same hook in shorter form |
| "Would you be open to a call?" | "When do you have 15 minutes for a demo?" |
| "I'd love to learn more about your work" | State what you know, ask for the meeting |
| Send a blank connection request | Always include a message |
| Include calendar links | Ask for their availability |
| Use hashtags or emojis | Plain text only |
| Mention LinkedIn itself | Reference their work, not the platform |

---

## InMail Subject Lines (When Applicable)

Same personalization token as the email, rephrased:
- If email subject was `Financial models for the ABH deal` → InMail: `ABH modeling, quick demo`
- If email subject was `Faster modeling for Oaklins` → InMail: `Oaklins deal team, 10-minute models`
- Keep under 60 characters
- Vary structure every time
