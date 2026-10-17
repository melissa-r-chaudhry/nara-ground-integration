# Nara Ground — Integration Layer

**What it is:** The backend integration layer connecting a hackathon-built volunteer-coordination frontend to real campaign infrastructure.
**Why it existed:** The frontend existed; nothing connected it to real data yet.
**What I owned:** Explicitly scoped to what's actually mine — the schema and routing logic only. The frontend is the hackathon team's work and isn't included here.
**Stack:** PostgreSQL, n8n.
**Production status:** Schema and routing logic complete; webhook endpoints were the next planned piece.

---

The backend integration connecting **Nara**, a volunteer-coordination
frontend built by a hackathon team, to a campaign's own infrastructure
(Airtable, PostgreSQL, n8n).

**Scope note:** the Nara frontend itself is someone else's work (built by
the hackathon team that created it) and isn't included here. This repo is
specifically the piece built independently on top of it: the data layer and
routing logic that connect that frontend to real campaign operations.

## What's here

- **`schema.sql`** — PostgreSQL schema additions: volunteer lane/rank/streak
  tracking, magic-link passwordless auth tokens, and shift check-in/out
  records.
- **`lane-routing.js`** — volunteer intake routing logic (n8n Code node).
  Takes a volunteer's stated interests from an intake form and assigns them
  to one of three engagement lanes:
  - **Shield** — direct voter contact (canvassing, phone/text banking,
    tabling, GOTV)
  - **Spark** — recruitment and relationship-building (hosting, referrals)
  - **Signal** — amplification and systems (social media, tech support,
    design, admin)

  Includes a deliberate edge case: volunteers who select both "multilingual
  outreach" and "flyering with conversations" are flagged for high-value
  immigrant-corridor canvassing assignments, regardless of their primary
  lane — a real operational need, not a generic routing rule.

## Design

Data flows one way: **PostgreSQL (authoritative) → Airtable (campaign
manager view) + Listmonk (lane-targeted email)**, never the reverse —
PostgreSQL is the system of record for the volunteer portal, the others are
read-out views for people and tools that don't need direct DB access.

## Status

Volunteer roster schema and lane-routing logic complete; webhook endpoints
connecting the frontend to this layer were the next planned piece.
