#!/usr/bin/env node

/**
 * HubSpot Replied Segment Follow-Up Report
 *
 * Usage:
 *   HUBSPOT_ACCESS_TOKEN=your_token node replied-followups.js
 *
 * Pulls contacts from the "Replied" segment, analyzes follow-up gaps,
 * and prints a prioritized action report.
 */

const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
if (!TOKEN) {
  console.error("Error: Set HUBSPOT_ACCESS_TOKEN environment variable.");
  process.exit(1);
}

const BASE = "https://api.hubapi.com";

// ── Configurable thresholds (days) ───────────────────────────────────
const STALE_REPLY_DAYS = 7;       // replied this many days ago without follow-up = urgent
const COLD_CONTACT_DAYS = 14;     // not contacted in this many days = going cold
const INTERNAL_DOMAINS = ["socratics.ai"]; // filter out internal team

async function api(method, path, body) {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

function daysBetween(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function pad(str, len) {
  str = String(str);
  return str.length >= len ? str.slice(0, len) : str + " ".repeat(len - str.length);
}

function rpad(str, len) {
  str = String(str);
  return str.length >= len ? str.slice(0, len) : " ".repeat(len - str.length) + str;
}

async function main() {
  // 1. Find the Replied list
  console.log("Finding Replied segment...");
  const search = await api("POST", "/crm/v3/lists/search", {
    query: "replied", objectTypeId: "0-1",
  });

  const list = search.lists?.find(l => l.name.toLowerCase() === "replied");
  if (!list) {
    console.error("Could not find a list named 'Replied'.");
    process.exit(1);
  }

  const listSize = list.additionalProperties?.hs_list_size || "?";
  console.log(`Found list "${list.name}" (${listSize} contacts)\n`);

  // 2. Get member IDs (paginate)
  let memberIds = [];
  let after = null;
  while (true) {
    const url = `/crm/v3/lists/${list.listId}/memberships?limit=100${after ? `&after=${after}` : ""}`;
    const data = await api("GET", url);
    memberIds.push(...data.results.map(r => r.recordId));
    if (data.paging?.next?.after) { after = data.paging.next.after; } else break;
  }

  if (memberIds.length === 0) {
    console.log("No contacts in the Replied segment.");
    return;
  }

  // 3. Batch read contacts (max 100 per batch)
  const allContacts = [];
  for (let i = 0; i < memberIds.length; i += 100) {
    const batch = memberIds.slice(i, i + 100);
    const data = await api("POST", "/crm/v3/objects/contacts/batch/read", {
      properties: [
        "firstname", "lastname", "email", "company", "jobtitle",
        "lifecyclestage", "hs_lead_status", "notes_last_contacted",
        "hs_sales_email_last_replied", "hs_sequences_is_enrolled",
      ],
      inputs: batch.map(id => ({ id })),
    });
    allContacts.push(...data.results);
  }

  // 4. Parse and enrich
  const contacts = allContacts
    .map(r => {
      const p = r.properties;
      const email = p.email || "";
      const domain = email.split("@")[1] || "";
      const isInternal = INTERNAL_DOMAINS.some(d => domain.endsWith(d));
      const isTest = (p.firstname || "").toLowerCase().includes("test");

      return {
        id: r.id,
        name: [p.firstname, p.lastname].filter(Boolean).join(" ") || "Unknown",
        email,
        domain,
        company: p.company || "—",
        title: p.jobtitle || "—",
        stage: p.lifecyclestage || "—",
        leadStatus: p.hs_lead_status || "—",
        lastReplied: p.hs_sales_email_last_replied,
        daysSinceReply: daysBetween(p.hs_sales_email_last_replied),
        lastContacted: p.notes_last_contacted,
        daysSinceContact: daysBetween(p.notes_last_contacted),
        inSequence: p.hs_sequences_is_enrolled === "true",
        isInternal,
        isTest,
      };
    })
    .filter(c => !c.isInternal && !c.isTest);

  // 5. Categorize
  const urgent = [];     // replied but never followed up, or reply is stale
  const high = [];       // replied recently, active but need attention
  const onTrack = [];    // recently contacted, seems fine
  const inSequence = []; // still in a sequence

  for (const c of contacts) {
    if (c.inSequence) {
      inSequence.push(c);
      continue;
    }

    // Check if reply came AFTER last contact by more than 1 hour
    // (same-day back-and-forth is normal, not a missed follow-up)
    const replyTime = c.lastReplied ? new Date(c.lastReplied).getTime() : 0;
    const contactTime = c.lastContacted ? new Date(c.lastContacted).getTime() : 0;
    const ONE_HOUR = 3600000;

    const repliedWithNoFollowUp = c.lastReplied &&
      (!c.lastContacted || (replyTime - contactTime > ONE_HOUR));

    const contactGoneStale = c.daysSinceContact !== null && c.daysSinceContact >= COLD_CONTACT_DAYS;
    const replyGoneStale = c.daysSinceReply !== null && c.daysSinceReply >= STALE_REPLY_DAYS;

    if (repliedWithNoFollowUp || contactGoneStale) {
      urgent.push(c);
    } else if (replyGoneStale) {
      high.push(c);
    } else {
      onTrack.push(c);
    }
  }

  // Sort each bucket: most stale first
  const sortByUrgency = (a, b) => (b.daysSinceReply || 0) - (a.daysSinceReply || 0);
  urgent.sort(sortByUrgency);
  high.sort(sortByUrgency);
  onTrack.sort(sortByUrgency);

  // 6. Print report
  const now = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║              REPLIED SEGMENT — FOLLOW-UP REPORT                ║");
  console.log(`║  ${pad(now, 64)}║`);
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  console.log(`  Total in segment: ${allContacts.length}  |  External: ${contacts.length}  |  In sequences: ${inSequence.length}\n`);

  function printSection(title, items, color) {
    if (items.length === 0) return;
    console.log(`\n  ${color}${title} (${items.length})${ "\x1b[0m"}`);
    console.log(`  ${"─".repeat(64)}`);
    console.log(`  ${pad("Name", 22)} ${pad("Company", 20)} ${rpad("Replied", 8)} ${rpad("Contacted", 10)} ${pad("Stage", 12)}`);
    console.log(`  ${pad("─".repeat(20), 22)} ${pad("─".repeat(18), 20)} ${rpad("─".repeat(7), 8)} ${rpad("─".repeat(9), 10)} ${pad("─".repeat(10), 12)}`);

    for (const c of items) {
      const replyAge = c.daysSinceReply !== null ? `${c.daysSinceReply}d ago` : "—";
      const contactAge = c.daysSinceContact !== null ? `${c.daysSinceContact}d ago` : "never";
      console.log(`  ${pad(c.name, 22)} ${pad(c.company, 20)} ${rpad(replyAge, 8)} ${rpad(contactAge, 10)} ${pad(c.stage, 12)}`);
      if (c.title !== "—") {
        console.log(`  ${pad("", 22)} ${pad(c.title, 20)}`);
      }
    }
  }

  printSection("🔴 URGENT — Needs immediate follow-up", urgent, "\x1b[31m\x1b[1m");
  printSection("🟡 HIGH — Replied but going stale", high, "\x1b[33m\x1b[1m");
  printSection("🟢 ON TRACK — Recently contacted", onTrack, "\x1b[32m\x1b[1m");
  printSection("🔵 IN SEQUENCE — Auto-managed", inSequence, "\x1b[34m\x1b[1m");

  // 7. Action items
  if (urgent.length > 0) {
    console.log("\n\n  ┌─────────────────────────────────────────────────────────────┐");
    console.log("  │  TOP ACTION ITEMS                                          │");
    console.log("  └─────────────────────────────────────────────────────────────┘\n");

    for (let i = 0; i < Math.min(urgent.length, 5); i++) {
      const c = urgent[i];
      const replyDate = fmtDate(c.lastReplied);
      const contactDate = fmtDate(c.lastContacted);
      let action = "";

      if (c.daysSinceContact >= 30) {
        action = `Gone cold. Replied ${replyDate}, last contacted ${contactDate}. Re-engage or close out.`;
      } else if (!c.lastContacted || new Date(c.lastReplied) > new Date(c.lastContacted)) {
        action = `Replied ${replyDate} but no follow-up since. Reach out today.`;
      } else {
        action = `Replied ${replyDate}, last contacted ${contactDate}. Overdue for follow-up.`;
      }

      console.log(`  ${i + 1}. \x1b[1m${c.name}\x1b[0m (${c.company})`);
      console.log(`     ${action}`);
      console.log(`     ${c.email}\n`);
    }
  }

  console.log("  ─────────────────────────────────────────────────────────────");
  console.log("  Report complete.\n");
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
