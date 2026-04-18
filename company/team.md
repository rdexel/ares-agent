# Team

People, inboxes, authority. Used to route work and attribute authorship.

---

## Raleigh Dexel — Head of GTM

- **Email:** raleigh@socratics.ai
- **HubSpot owner ID:** 161977243
- **Calendar:** https://meetings-na2.hubspot.com/raleigh-dexel
- **Authority:** Runs GTM end-to-end. Primary operator for this workspace. Approves outreach, sequence enrollments, and prospect-facing sends.
- **Default inbox** for Ares unless the context says otherwise.

## Tim Eun — CEO

- **Email:** tim@socratics.ai (also aliased `tim.ceo@socratics.io` for cold outreach sender config)
- **HubSpot owner ID:** 161538153 (associated with timeun@gmail.com)
- **Calendar:** https://meetings-na2.hubspot.com/tim-eun
- **Authority:** Founder-weight communication. Handles investor/partner/BD conversations, warm LinkedIn follow-ups, senior demos.
- **Use Tim's inbox when:** message is to an investor, partner, BD contact, or thread is already in Tim's inbox. Ares should infer this from context.

---

## Inbox routing

| Signal | Account |
|--------|---------|
| Prospect replies, GTM outreach, Raleigh's outbound | `raleigh` (default) |
| Investor / partner / BD comms | `tim` |
| Thread is already in Tim's inbox | `tim` |
| "Draft for Tim" explicit | `tim` |

Don't ask which inbox — infer.

---

## Sender config for sequences (cold outreach)

| Field | Value |
|-------|-------|
| `senderEmail` | `raleigh@socratics.ai` |
| `senderAliasAddress` | `tim.ceo@socratics.io` |
| `userId` | `161977243` |

Cold emails go out as Tim's alias, from Raleigh's inbox. Raleigh is the reviewer; Tim is the sender-of-record.
