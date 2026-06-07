# 🐆 Ghost Panther Protocol

> A production-grade personal fitness OS powered by AI. Built from zero to deployment as a real-world portfolio project.

**[→ Live Dashboard](https://T00f-io.github.io/ghost-panther-dashboard)** &nbsp;|&nbsp; **[→ Project Showcase](https://T00f-io.github.io/ghost-panther-dashboard/showcase.html)**

---

## What Is This?

Ghost Panther Protocol (GPP) is a full-stack AI-powered fitness dashboard that replaces a fragmented, manual training log workflow with a single intelligent system. It ingests raw workout notes, parses them using the Claude API, stores all training data in PostgreSQL, and surfaces coaching insights at the session, weekly, and arc level.

Built simultaneously as a **daily-use personal tool** and an **AI engineering portfolio project**.

---

## The Problem It Solves

Training 4–5x per week on a structured 90-day program generated detailed session data with nowhere to live efficiently. The old workflow:

1. Dictate raw notes in a mobile app
2. Run through a specialized AI agent to format
3. Manually copy output into Google Sheets
4. Perform analysis separately — if at all

**High friction. Inconsistent logging. No coaching feedback. No trend visibility.**

GPP eliminates all four steps. One tap from Apple Notes sends a workout through a Cloudflare Worker, through Claude, and into Supabase — then auto-deletes the note.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| AI | Claude API — `claude-sonnet-4-5` |
| API Security | Cloudflare Workers (×2) |
| Hosting | GitHub Pages |
| Automation | Apple Notes + iOS Shortcuts |

---

## Architecture

```
Apple Notes (WoD folder)
    ↓  iOS Shortcut (HTTP POST)
Cloudflare Worker — gpp-log-worker
    ↓  Parse header (date, arc, type, focus)
    ↓  Claude API — structure movements + detect injuries
    ↓  Supabase REST API — write sessions, movements, injuries
Dashboard (GitHub Pages)
    ↓  Supabase — fetch data
    ↓  Cloudflare Worker — gpp-api-worker
    ↓  Claude API — insights, generation, analysis
```

---

## Features

### 📊 Personal Modules (per user)
| Tab | Description |
|---|---|
| ⚔️ Journal | Session history with arc/type filters, movement detail, per-session AI coaching |
| ⚖️ Weight | Daily logging, 7-day rolling average, goal line, trend chart |
| 📏 Body Comp | Monthly check-ins, measurements, delta tracking |
| 📊 Analytics | Volume charts, implement frequency, focus breakdown — filterable by arc |
| 🧠 Insights | Weekly AI summary + full arc coaching report |
| 📜 Arc History | Arc lifecycle management, session browser, completion tracking |
| 🩹 Injuries | Auto-detection on log entry, manual entry, active injury banner |
| 👤 Profile | In-dashboard profile editor (name, age, goals, known flags) |
| ➕ Log | Direct workout entry with AI categorization |

### 🔗 Shared Modules
| Tab | Description |
|---|---|
| 📋 Program | 6 programmed day types with full movement reference |
| 🗂️ Movements | 70+ movement library — searchable by Category, Pattern, Implement |
| ⚡ Generate | AI workout builder — log generated sessions directly to journal |

---

## AI Use Cases

Four distinct Claude API integrations:

1. **Structured Parsing** — Raw unformatted workout notes → relational DB records
2. **Session Coaching** — Per-session performance analysis, injury flags, next-session recommendations
3. **Arc Intelligence** — Cross-session pattern detection, trend analysis, progression assessment
4. **Workout Generation** — Custom sessions built from personal movement library and equipment database
5. **Injury Detection** — Automatic scanning of session notes for injury signals on every log entry

---

## Database Schema

```
users               — profiles, goals, known flags
workout_sessions    — session-level data (per user)
workout_movements   — movement-level data (per user)
weight_logs         — daily weight entries (per user)
arc_config          — arc configuration (per user)
body_comp           — monthly check-ins (per user)
raw_logs            — raw capture text (per user)
injuries            — injury log with auto-detection (per user)
movements           — movement library (shared)
equipment           — home gym inventory (shared)
```

All tables have Row-Level Security enabled via Supabase.

---

## Capture Pipeline

Write workout notes in Apple Notes → tap one shortcut → done.

```
Notes (WoD folder)  →  iOS Shortcut  →  gpp-log-worker
→  Header parsed (date, arc, type, focus)
→  Claude API structures movements + detects injuries
→  Supabase writes session + movements + injuries
→  Note deleted, fresh template created
```

---

## Sprint History

| Sprint | Focus | Status |
|---|---|---|
| 1 | Foundation — scaffold, DB, Supabase, Claude API, GitHub Pages | ✅ Complete |
| 2 | Core — direct log entry, weight tracking, analytics, arc management | ✅ Complete |
| 3 | AI layer — insights, movement library, workout generator, multi-user, Shortcuts | ✅ Complete |
| 4 | Polish — injury tracker, arc history, profile editor, analytics by arc | ✅ Complete |
| 5 | Feedback revisions, Anna's arc, export, body comp photos | 🔜 Planned |

---

## Running Locally

```bash
# Clone
git clone https://github.com/T00f-io/ghost-panther-dashboard.git
cd ghost-panther-dashboard

# Install
npm install

# Dev server
npm run dev

# Deploy to GitHub Pages
npm run deploy
```

### Environment

Create `src/supabaseClient.js`:

```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_ANON_KEY')
```

The Cloudflare Worker (`gpp-api-worker`) handles the Anthropic API key securely — it is never exposed in the frontend.

---

## Users

| User | Goal | Arc |
|---|---|---|
| JC | 185 lbs by Oct 2026 | Gohan: Controlled Power → Awakening Flow → Super Saiyan Resolve |
| Anna | 115 lbs | TBD — 30-day mobility arc |

---

## Portfolio Notes

This project demonstrates end-to-end AI product engineering including:

- **React** component architecture and state management
- **PostgreSQL** relational schema design with RLS security
- **Claude API** prompt engineering for 5 distinct use cases
- **Cloudflare Workers** secure API proxy pattern
- **Automated iOS pipeline** — Notes → Worker → Claude → Supabase
- **Multi-user** data scoping and access control
- **CI/CD** deployment via GitHub Pages

Built independently from zero to production. Every feature is live, functional, and actively used in daily training.

---

## Links

- **Live Dashboard** → https://T00f-io.github.io/ghost-panther-dashboard
- **Project Showcase** → https://T00f-io.github.io/ghost-panther-dashboard/showcase.html
- **GitHub** → https://github.com/T00f-io/ghost-panther-dashboard

---

*Built by [@T00f-io](https://github.com/T00f-io) · React · Supabase · Claude API · Cloudflare Workers*
