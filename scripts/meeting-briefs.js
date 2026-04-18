#!/usr/bin/env node

/**
 * HubSpot Meeting Briefs Generator
 *
 * Usage:
 *   HUBSPOT_ACCESS_TOKEN=hs_token ANTHROPIC_API_KEY=sk_key node meeting-briefs.js
 *
 * Fetches demo meetings for this week, researches companies and
 * attendees, runs everything through Claude for analysis, and
 * exports each brief as a shareable .docx file.
 */

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
} = require("docx");

const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!TOKEN) {
  console.error("Error: Set HUBSPOT_ACCESS_TOKEN environment variable.");
  process.exit(1);
}
if (!ANTHROPIC_KEY) {
  console.error("Error: Set ANTHROPIC_API_KEY environment variable.");
  process.exit(1);
}

const BASE = "https://api.hubapi.com";
const OUTPUT_DIR = path.join(__dirname, "briefs");

// ── Claude helper ────────────────────────────────────────────────────

async function askClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

// ── HubSpot helpers ──────────────────────────────────────────────────

async function hubspot(method, urlPath, body) {
  const url = `${BASE}${urlPath}`;
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${urlPath} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Web research helpers ─────────────────────────────────────────────

async function fetchPageText(url, timeout = 8000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

function extractText(html) {
  if (!html) return "";
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text.slice(0, 4000);
}

function extractMeta(html) {
  const meta = {};
  const descMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
  );
  if (descMatch) meta.description = descMatch[1].trim();
  if (!meta.description) {
    const ogMatch = html.match(
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
    );
    if (ogMatch) meta.description = ogMatch[1].trim();
  }
  return meta;
}

async function scrapeCompany(domain) {
  if (!domain) return { domain, pages: {} };
  const base = domain.startsWith("http") ? domain : `https://${domain}`;
  console.log(`    Scraping ${domain}...`);

  const pagesToTry = ["", "/about", "/about-us", "/team", "/our-team"];
  const pages = {};

  await Promise.all(
    pagesToTry.map(async (pagePath) => {
      const html = await fetchPageText(`${base}${pagePath}`);
      if (html) {
        pages[pagePath || "/"] = {
          text: extractText(html),
          meta: extractMeta(html),
        };
      }
    })
  );

  return { domain, pages };
}

async function searchPerson(name, company) {
  if (!name || name === "Unknown") return null;
  const query = encodeURIComponent(`"${name}" ${company || ""}`);
  const url = `https://lite.duckduckgo.com/lite/?q=${query}`;
  console.log(`    Searching for ${name}...`);

  const html = await fetchPageText(url);
  if (!html) return null;

  const snippets = [];
  const pattern = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null && snippets.length < 5) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text) snippets.push(text);
  }

  const titles = [];
  const titlePattern = /<a[^>]*class="result-link"[^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = titlePattern.exec(html)) !== null && titles.length < 5) {
    titles.push(match[1].replace(/<[^>]+>/g, "").trim());
  }

  return { name, snippets, titles };
}

// ── Date & formatting helpers ────────────────────────────────────────

function getWeekRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = start.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const end = new Date(start);
  end.setDate(end.getDate() + daysUntilSunday);
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime() };
}

function formatDate(ts) {
  if (!ts) return "N/A";
  return new Date(ts).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function formatShortDate(ts) {
  if (!ts) return "N/A";
  return new Date(ts).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function formatCurrency(val) {
  if (!val) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(Number(val));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── HubSpot data fetchers ────────────────────────────────────────────

async function searchMeetingsThisWeek() {
  const { start, end } = getWeekRange();
  const results = [];
  let after;

  while (true) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: "hs_meeting_start_time", operator: "GTE", value: String(start) },
          { propertyName: "hs_meeting_start_time", operator: "LTE", value: String(end) },
        ],
      }],
      properties: [
        "hs_meeting_title", "hs_meeting_body", "hs_meeting_start_time",
        "hs_meeting_end_time", "hs_meeting_location", "hs_meeting_outcome",
        "hubspot_owner_id", "hs_internal_meeting_notes",
      ],
      sorts: [{ propertyName: "hs_meeting_start_time", direction: "ASCENDING" }],
      limit: 100,
    };
    if (after) body.after = after;
    const data = await hubspot("POST", "/crm/v3/objects/meetings/search", body);
    results.push(...data.results);
    if (data.paging?.next?.after) { after = data.paging.next.after; } else { break; }
  }
  return results;
}

async function getAssociations(meetingId, toObjectType) {
  try {
    const data = await hubspot("GET", `/crm/v3/objects/meetings/${meetingId}/associations/${toObjectType}`);
    return data.results || [];
  } catch { return []; }
}

async function getContact(contactId) {
  try {
    return await hubspot("GET",
      `/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,jobtitle,phone,company,lifecyclestage,hs_lead_status,notes_last_contacted,hs_linkedin_url`
    );
  } catch { return null; }
}

async function getCompany(companyId) {
  try {
    return await hubspot("GET",
      `/crm/v3/objects/companies/${companyId}?properties=name,domain,industry,annualrevenue,numberofemployees,city,state,country,description,linkedin_company_page,founded_year,hs_num_open_deals`
    );
  } catch { return null; }
}

async function getDealsForContact(contactId) {
  try {
    const assocs = await hubspot("GET", `/crm/v3/objects/contacts/${contactId}/associations/deals`);
    if (!assocs.results?.length) return [];
    const deals = await Promise.all(
      assocs.results.slice(0, 5).map((a) =>
        hubspot("GET", `/crm/v3/objects/deals/${a.id}?properties=dealname,dealstage,amount,pipeline,closedate`).catch(() => null)
      )
    );
    return deals.filter(Boolean);
  } catch { return []; }
}

// ── Brief generation ─────────────────────────────────────────────────

async function generateBrief(meeting) {
  const props = meeting.properties;
  const title = props.hs_meeting_title || "Untitled Meeting";
  const startTime = formatDate(props.hs_meeting_start_time);
  const endTime = formatDate(props.hs_meeting_end_time);
  const location = props.hs_meeting_location || "Not specified";
  const agenda = stripHtml(props.hs_meeting_body);

  console.log(`\nProcessing: ${title}`);
  console.log(`  Fetching HubSpot data...`);

  const [contactAssocs, companyAssocs] = await Promise.all([
    getAssociations(meeting.id, "contacts"),
    getAssociations(meeting.id, "companies"),
  ]);

  const contacts = (await Promise.all(contactAssocs.map((a) => getContact(a.id)))).filter(Boolean);
  const companies = (await Promise.all(companyAssocs.map((a) => getCompany(a.id)))).filter(Boolean);
  const contactDeals = await Promise.all(contacts.map((c) => getDealsForContact(c.id)));
  const allDeals = contactDeals.flat();

  // ── Gather raw research ──
  console.log(`  Researching online...`);

  const companyScrapings = await Promise.all(
    companies.map((c) => scrapeCompany(c.properties.domain))
  );

  const personSearches = await Promise.all(
    contacts.map((c) => {
      const name = [c.properties.firstname, c.properties.lastname].filter(Boolean).join(" ");
      return searchPerson(name, c.properties.company);
    })
  );

  // ── Build raw context for Claude ──

  const rawContext = {
    meeting: { title, startTime, endTime, location, agenda },
    attendees: contacts.map((c, i) => ({
      hubspot: c.properties,
      webResults: personSearches[i],
    })),
    companies: companies.map((c, i) => ({
      hubspot: c.properties,
      scraping: companyScrapings[i],
    })),
    deals: allDeals.map((d) => d.properties),
  };

  // ── Ask Claude to synthesize the brief as structured JSON ──
  console.log(`  Analyzing with Claude...`);

  const systemPrompt = `You are a sales intelligence analyst preparing a meeting brief for a sales team.
You will receive raw data: HubSpot CRM records, scraped website text, and web search results about companies and people.

Synthesize this into insight-driven analysis. Do NOT regurgitate website copy. Instead:

For companies: What do they actually do in plain language? Market position, strategy, niche? Growth signals? Fit for our product?
For people: Role and influence in buying decision? Professional background? How to tailor the demo to them?

Return ONLY valid JSON (no markdown fences, no explanation) matching this exact schema:

{
  "executiveSummary": "2-3 sentences on who they are and why this meeting matters",
  "companies": [
    {
      "name": "Company Name",
      "overview": "Plain-language description of what they do",
      "marketPosition": "Their niche, strategy, differentiators",
      "growthSignals": ["signal 1", "signal 2"],
      "fitIndicators": ["reason they could be a good customer"]
    }
  ],
  "attendees": [
    {
      "name": "Full Name",
      "title": "Job Title",
      "email": "email",
      "phone": "phone or null",
      "linkedin": "url or null",
      "buyingInfluence": "Decision maker / Influencer / Evaluator",
      "background": "Professional background summary",
      "demoApproach": "How to tailor the demo for this person"
    }
  ],
  "deals": [
    {
      "name": "Deal Name",
      "stage": "Stage",
      "amount": "Amount or TBD",
      "closeDate": "Date"
    }
  ],
  "talkingPoints": ["specific, actionable point 1", "point 2"],
  "risks": ["risk or watch-out 1", "risk 2"],
  "nextSteps": ["suggested next step 1", "step 2"]
}`;

  const userPrompt = `Here is the raw data. Return structured JSON only.

${JSON.stringify(rawContext, null, 2)}`;

  const response = await askClaude(systemPrompt, userPrompt);
  let brief;
  try {
    brief = JSON.parse(response);
  } catch {
    // Try extracting JSON from response if wrapped in text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      brief = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Claude did not return valid JSON");
    }
  }

  return { title, brief, startTime, endTime, location, agenda };
}

// ── DOCX builder ─────────────────────────────────────────────────────

function buildDocx({ title, brief, startTime, endTime, location, agenda }) {
  const children = [];

  // ── Helper functions ──
  const heading = (text, level = HeadingLevel.HEADING_1) =>
    new Paragraph({ heading: level, spacing: { before: 300, after: 100 }, children: [new TextRun({ text, bold: true })] });

  const bodyText = (text) =>
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text, size: 22 })] });

  const boldBodyText = (label, value) =>
    new Paragraph({ spacing: { after: 60 }, children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22 }),
      new TextRun({ text: value, size: 22 }),
    ]});

  const bulletPoint = (text) =>
    new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 40 },
      children: [new TextRun({ text, size: 22 })],
    });

  const emptyLine = () => new Paragraph({ spacing: { after: 80 }, children: [] });

  // ── Title ──
  children.push(new Paragraph({
    heading: HeadingLevel.TITLE,
    spacing: { after: 60 },
    children: [new TextRun({ text: `Meeting Brief`, bold: true, size: 36 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: title, size: 28, color: "444444" })],
  }));

  // ── Meeting details ──
  children.push(boldBodyText("Date & Time", startTime));
  children.push(boldBodyText("End Time", endTime));
  children.push(boldBodyText("Location", location));
  if (agenda) children.push(boldBodyText("Agenda", agenda));
  children.push(emptyLine());

  // ── Executive Summary ──
  children.push(heading("Executive Summary", HeadingLevel.HEADING_1));
  children.push(bodyText(brief.executiveSummary));
  children.push(emptyLine());

  // ── Company Research ──
  if (brief.companies?.length) {
    children.push(heading("Company Research", HeadingLevel.HEADING_1));
    for (const co of brief.companies) {
      children.push(heading(co.name, HeadingLevel.HEADING_2));
      children.push(bodyText(co.overview));
      children.push(emptyLine());
      if (co.marketPosition) {
        children.push(boldBodyText("Market Position", co.marketPosition));
      }
      if (co.growthSignals?.length) {
        children.push(new Paragraph({ spacing: { before: 100, after: 40 }, children: [new TextRun({ text: "Growth Signals", bold: true, size: 22 })] }));
        for (const s of co.growthSignals) children.push(bulletPoint(s));
      }
      if (co.fitIndicators?.length) {
        children.push(new Paragraph({ spacing: { before: 100, after: 40 }, children: [new TextRun({ text: "Why They Could Be a Fit", bold: true, size: 22 })] }));
        for (const f of co.fitIndicators) children.push(bulletPoint(f));
      }
      children.push(emptyLine());
    }
  }

  // ── Attendees ──
  if (brief.attendees?.length) {
    children.push(heading("Attendees", HeadingLevel.HEADING_1));
    for (const att of brief.attendees) {
      children.push(heading(att.name, HeadingLevel.HEADING_2));
      if (att.title) children.push(boldBodyText("Title", att.title));
      if (att.email) children.push(boldBodyText("Email", att.email));
      if (att.phone) children.push(boldBodyText("Phone", att.phone));
      if (att.linkedin) children.push(boldBodyText("LinkedIn", att.linkedin));
      if (att.buyingInfluence) children.push(boldBodyText("Buying Influence", att.buyingInfluence));
      if (att.background) children.push(boldBodyText("Background", att.background));
      if (att.demoApproach) children.push(boldBodyText("Demo Approach", att.demoApproach));
      children.push(emptyLine());
    }
  }

  // ── Deals ──
  if (brief.deals?.length) {
    children.push(heading("Deal Summary", HeadingLevel.HEADING_1));
    for (const d of brief.deals) {
      children.push(boldBodyText("Deal", d.name));
      children.push(boldBodyText("Stage", d.stage));
      children.push(boldBodyText("Amount", d.amount || "TBD"));
      children.push(boldBodyText("Close Date", d.closeDate || "—"));
      children.push(emptyLine());
    }
  }

  // ── Talking Points ──
  if (brief.talkingPoints?.length) {
    children.push(heading("Key Talking Points", HeadingLevel.HEADING_1));
    for (const tp of brief.talkingPoints) children.push(bulletPoint(tp));
    children.push(emptyLine());
  }

  // ── Risks ──
  if (brief.risks?.length) {
    children.push(heading("Risks & Watch-Outs", HeadingLevel.HEADING_1));
    for (const r of brief.risks) children.push(bulletPoint(r));
    children.push(emptyLine());
  }

  // ── Next Steps ──
  if (brief.nextSteps?.length) {
    children.push(heading("Suggested Next Steps", HeadingLevel.HEADING_1));
    for (const ns of brief.nextSteps) children.push(bulletPoint(ns));
    children.push(emptyLine());
  }

  // ── Footer ──
  children.push(new Paragraph({
    spacing: { before: 400 },
    children: [new TextRun({ text: "Auto-generated from HubSpot CRM data and web research. Please verify key details before the meeting.", italics: true, size: 18, color: "888888" })],
  }));

  return new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    sections: [{ children }],
  });
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Searching for demo meetings this week...");

  const meetings = await searchMeetingsThisWeek();
  if (meetings.length === 0) {
    console.log("No meetings found for this week.");
    return;
  }

  const demoMeetings = meetings.filter((m) =>
    (m.properties.hs_meeting_title || "").toLowerCase().includes("demo")
  );

  const targetMeetings = demoMeetings.length > 0 ? demoMeetings : meetings;
  console.log(
    demoMeetings.length > 0
      ? `Found ${demoMeetings.length} demo meeting(s).`
      : `No "demo" meetings found — generating briefs for all ${meetings.length} meeting(s).`
  );

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const exportedFiles = [];

  for (const meeting of targetMeetings) {
    const briefData = await generateBrief(meeting);
    const doc = buildDocx(briefData);
    const buffer = await Packer.toBuffer(doc);
    const filename = `${slugify(briefData.title)}.docx`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    exportedFiles.push(filepath);
    console.log(`  ✓ Exported: briefs/${filename}`);
  }

  console.log(`\nDone! ${exportedFiles.length} brief(s) saved to ./briefs/`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
