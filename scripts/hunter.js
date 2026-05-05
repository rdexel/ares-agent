#!/usr/bin/env node

/**
 * Hunter.io CLI wrapper
 *
 * Usage:
 *   HUNTER_API_KEY=... node scripts/hunter.js domain <domain>
 *   HUNTER_API_KEY=... node scripts/hunter.js find <first> <last> <domain>
 *   HUNTER_API_KEY=... node scripts/hunter.js verify <email>
 *   HUNTER_API_KEY=... node scripts/hunter.js count <domain>
 *
 * Or load from .env automatically:
 *   node -r ./scripts/load-env.js scripts/hunter.js domain stripe.com
 */

const BASE = "https://api.hunter.io/v2";
const KEY = process.env.HUNTER_API_KEY;

if (!KEY) {
  console.error("Error: Set HUNTER_API_KEY environment variable.");
  process.exit(1);
}

async function get(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  const json = await res.json();

  if (!res.ok) {
    const msg = json.errors?.[0]?.details || json.message || "API error";
    throw new Error(msg);
  }
  return json.data;
}

function printEmails(emails = []) {
  if (!emails.length) { console.log("  (none found)"); return; }
  for (const e of emails) {
    const conf = e.confidence != null ? ` [${e.confidence}%]` : "";
    const name = [e.first_name, e.last_name].filter(Boolean).join(" ");
    const title = e.position ? ` — ${e.position}` : "";
    console.log(`  ${e.value}${conf}${name ? ` (${name}${title})` : ""}`);
  }
}

const commands = {
  async domain([domain]) {
    if (!domain) throw new Error("Usage: hunter.js domain <domain>");
    const data = await get("/domain-search", { domain, limit: 10 });
    console.log(`\nDomain: ${data.domain}`);
    console.log(`Organization: ${data.organization || "—"}`);
    console.log(`Pattern: ${data.pattern || "—"}`);
    console.log(`Emails (top 10):`);
    printEmails(data.emails);
    console.log(`\nRaw:\n${JSON.stringify(data, null, 2)}`);
  },

  async find([firstName, lastName, domain]) {
    if (!firstName || !lastName || !domain)
      throw new Error("Usage: hunter.js find <first> <last> <domain>");
    const data = await get("/email-finder", {
      first_name: firstName,
      last_name: lastName,
      domain,
    });
    const conf = data.score != null ? ` [${data.score}% confidence]` : "";
    console.log(`\nEmail: ${data.email || "not found"}${conf}`);
    console.log(`Sources: ${(data.sources || []).length}`);
    console.log(`\nRaw:\n${JSON.stringify(data, null, 2)}`);
  },

  async verify([email]) {
    if (!email) throw new Error("Usage: hunter.js verify <email>");
    const data = await get("/email-verifier", { email });
    console.log(`\nEmail: ${data.email}`);
    console.log(`Status: ${data.status}`);
    console.log(`Score: ${data.score}`);
    console.log(`MX records: ${data.mx_records}`);
    console.log(`Disposable: ${data.disposable}`);
    console.log(`Webmail: ${data.webmail}`);
    console.log(`\nRaw:\n${JSON.stringify(data, null, 2)}`);
  },

  async count([domain]) {
    if (!domain) throw new Error("Usage: hunter.js count <domain>");
    const data = await get("/email-count", { domain });
    console.log(`\nDomain: ${domain}`);
    console.log(`Total emails on file: ${data.total}`);
    console.log(`Personal: ${data.personal_emails}`);
    console.log(`Generic: ${data.generic_emails}`);
  },
};

const [, , cmd, ...args] = process.argv;

if (!cmd || !commands[cmd]) {
  console.error(
    "Commands:\n" +
      "  domain <domain>               — find emails for a domain\n" +
      "  find <first> <last> <domain>  — find one person's email\n" +
      "  verify <email>                — verify deliverability\n" +
      "  count <domain>                — count emails Hunter has on file"
  );
  process.exit(1);
}

commands[cmd](args).catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
