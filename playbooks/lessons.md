# Cross-Cutting Lessons

Compressed lessons from campaigns and runs. Keep this tight — only things that have shown up more than once, or cost us enough to remember.

---

## Cold outreach

### Openers must earn attention

- ❌ "Curious how the [Deal] model buildout went." — weak, asks without giving
- ❌ "How long did the [Deal] model take to build?" — no hook, reader has no reason to continue
- ❌ "How much time does the [Company] team spend..." — sounds like every SDR
- ✅ Lead with product value tied to their deal: "What if the 3-statement model for the [Deal] acquisition was done in 10 minutes instead of 10 hours?"

Observed in: Run 2 feedback (2026-04-08), memoryed feedback on "institutional, punchy, question-led" tone shift.

### Bare deal names mean nothing

A reader who sees "Spartaco" or "ABH" with no context has no idea what you're talking about. Always pair the name with a descriptor: *the Spartaco acquisition*, *the ABH recapitalization*, *the Franchise Creator sale*. "Deal" is always a safe fallback.

Observed in: Run 2 feedback.

### "At Socratics.ai, we..." is mandatory in cold body

Names the company and flows naturally into the pitch. Missing it makes the email feel anonymous or generic. Observed in: Run 2 feedback.

### CTA must name the company team

Not: "Happy to show you how it works." Yes: "Happy to show the [Company] team how it works." Specificity reads as genuine, not templated.

### No sign-off on cold first touch

Signature block handles the close. A manual "Best," on touch #1 looks template-y.

### Subject lines must say "financial modeling"

Not "intake layer," not "variance." The reader should know what the email is about from the subject. Memorized in feedback: cold subjects reference financial modeling explicitly.

---

## Research

### Filter roles BEFORE researching

Every web fetch costs time. Filter non-deal roles (IR, Marketing, Compliance, EAs, Finance/Accounting, COS) from the contact list *before* launching research agents. Saves 3–4 fetches per filtered contact.

Observed in: Run 1 debrief (2026-03-26).

### Group by email domain, not associatedcompanyid

HubSpot company-contact associations are wrong often enough to be dangerous. Sageview contacts showed up as Crestview, Clearview contacts showed up as Altamont. Email domain is reliable.

Observed in: Run 2 (2026-04-08).

### Press releases rarely name VPs

For VP-and-below deal attribution, check portfolio pages and individual bio pages. Don't bother with press releases (they only name MDs/Partners).

### LinkedIn doesn't render usefully via WebFetch

Rarely returns usable content. Prefer web search results over direct fetches.

---

## LinkedIn

### Tim's intro and the pitch are one motion

❌ "I'm Tim Eun, CEO of Socratics.ai. I wanted to reach out..."
✅ "I'm Tim, CEO at Socratics. We build audit-ready financial models..."

Separating the self-intro from the value prop makes both feel stiff. Combine them.

### Never reference email tracking

"I saw you opened my email" is creepy. Reference the topic ("the ABH model buildout"), not the signal.

### Account-level coordination matters

Multiple LinkedIn messages to contacts at the same firm should be staggered or consolidated. Triple-touching one firm (e.g., three Crestview contacts on the same day) is worse than one well-placed ask.

Observed in: 2026-04-16 LinkedIn follow-up batch.

### Wrong-list leakage happens

In the 2026-04-16 batch, Richard Savage (Xage cybersecurity) landed in a PE/IB LinkedIn follow-up list. Add a sanity check: if a contact is obviously out-of-ICP, flag for removal before drafting.

---

## Sequence operations

### Always check enrollment before pulling contacts for outreach

Before adding contacts to a new cold campaign, filter out anyone already enrolled in an active sequence or with a lead status indicating they're being worked. Double-enrolling is worse than under-reaching.

Observed in: Deal Reviewer pull feedback (memorized as `feedback_sequence_check`).

---

## Daily operations

### HubSpot tasks often lack contact associations

Common enough that the task-pull workflow has a fallback (parse from subject + known contact-company mappings). Not a bug — a pattern. See [operations/task-pull.md](../operations/task-pull.md).

### Closed-lost doesn't mean deleted

When an account closes lost, move its file to [archive/](../archive/) and extract any lesson to this file. Don't let dead deals clutter active memory — but don't lose the learning either.

---

## When to add here

If a correction from Raleigh/Tim lands more than once, or if a pattern surfaces in a campaign wrap-up, compress it to a 1–3 sentence entry here with a short "observed in" note. Don't write an essay. If the same lesson needs more than a paragraph, it belongs in its own playbook file.
