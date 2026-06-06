# 🎯 Career Copilot

An AI-powered job-fit analyzer and resume optimizer that works only from real, documented experience. It highlights and reframes. It never fabricates.

Built from zero as both a real job-search tool and an applied AI engineering portfolio project.

*Live demo and showcase links coming with the deployment release.*

→ [GitHub Repo](https://github.com/T00f-io/career-copilot)

---

## What Is This?

Career Copilot is a full-stack AI application that analyzes a job description against a structured vault of your real background, then returns an honest fit score, a gap breakdown, and evidence-based resume suggestions. A second mode evaluates Upwork gigs and drafts client proposals under strict integrity and voice constraints.

The core constraint shaped the entire design: **the tool cannot lie.** Every claim it surfaces must trace to something actually documented. That principle is enforced in the prompt layer, not just hoped for.

Built simultaneously as a personal job-search tool and an applied AI engineering portfolio piece.

---

## The Problem It Solves

Job and freelance applications are slow and guesswork-heavy. Most AI resume tools inflate: they pad experience, invent metrics, and write cover letters that fall apart the moment someone asks a follow-up question.

Career Copilot does the opposite. It gives a straight answer:

- Am I actually a fit for this role?
- Where are my real gaps, must-have vs nice-to-have?
- Which skills does this specific role prioritize?
- How do I reframe experience I genuinely have, without overclaiming experience I don't?

Honest assessment over flattery. Evidence over invention.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| AI | Claude API — claude-sonnet-4-5 |
| API Security | Cloudflare Worker (proxy) |
| Hosting | GitHub Pages |

---

## Architecture

```
React App (GitHub Pages)
    |  assemble vault into a structured context block
    |  Supabase REST API — fetch resume, work, projects, education, skills
Cloudflare Worker — career-copilot-worker
    |  attach Anthropic API key server-side (held as a secret)
    |  Claude API — analysis, optimization, gig verdicts, drafting
Structured JSON response
    |  parsed defensively, rendered as a Fit Report
    |  Supabase — analysis saved to history
```

The browser never sees the API key. It only ever talks to the Worker, which holds the key as a secret and forwards requests to Claude.

---

## Features

### Job Application Mode

| Module | Description |
|---|---|
| 🗂️ Resume Vault | Resume, work history, projects, education, and skills stored in Supabase as the single source of truth |
| 🎯 Job Analyzer | Paste a job description; the full vault is assembled and analyzed against the role |
| 📊 Fit Report | Honest fit score, summary, must-have vs nice-to-have gaps, prioritized skills, evidence-backed strengths |
| ✍️ Resume Optimizer | Bullet-level reframes plus surfacing of undersold experience, each suggestion citing its evidence |
| 🕓 Analysis History | Every analysis saved and revisitable, to compare fit across roles over time |

### Freelance Mode

| Module | Description |
|---|---|
| 💼 Gig Verdict | Send-or-skip framework: hard filters, green lights, red flags, stretch-bid logic. Missing data is marked unknown, never assumed to pass |
| 📝 Cover Letter Generator | Client-ready proposals under hard voice and integrity rules, with copy-to-clipboard, screening answers, and tactical notes |

### Cross-Cutting

| Feature | Description |
|---|---|
| 🧩 Plain-English Capture | Brain-dump a side project in natural language; Claude structures it into clean fields for review before saving |
| 📦 Store Rich, Output Brief | The vault holds full structured detail for accurate comparison; generated bullets and proposals apply smart brevity to what was actually produced |
| 🔒 Secure Proxy | A Cloudflare Worker holds the API key as a secret, off the public frontend |

---

## AI Use Cases

Distinct Claude API integrations, each with a purpose-built prompt:

1. **Fit Analysis** — vault + job description to a structured fit report with honest scoring
2. **Resume Optimization** — evidence-locked reframes and undersold-experience surfacing
3. **Gig Verdict** — applies a freelance send-or-skip framework to an Upwork post
4. **Proposal Drafting** — client cover letters under strict voice and integrity constraints
5. **Project Parsing** — freeform project descriptions structured into clean vault fields

Every prompt is engineered for a fixed JSON output shape and enforces integrity rules: no fabrication, evidence-backed claims only, and a clear line between proven LLM integration work and model building.

---

## Database Schema

```
resume_vault    — professional summary + full resume text (single source of truth)
work_history    — roles, titles, dates, descriptions
projects        — side projects: stack, problem, what was built, outcome, link
education       — credentials, institutions, fields, details
skills          — skills and tools, grouped by category
analyses        — saved fit analyses with score and full structured report
```

All tables have Row-Level Security enabled via Supabase.

---

## Sprint History

| Sprint | Focus | Status |
|---|---|---|
| 1 | Foundation — scaffold, Supabase, schema, RLS | ✅ Complete |
| 2 | Resume Vault + Cloudflare Worker Claude proxy | ✅ Complete |
| 3 | Job Analyzer, Fit Report, Resume Optimizer | ✅ Complete |
| 4 | Analysis History + Upwork freelance mode | ✅ Complete |
| — | Fast follow: projects, education, plain-English capture | ✅ Complete |
| 5 | Polish & deploy — GitHub Pages, README, showcase | 🔜 Planned |

---

## Running Locally

```bash
# Clone
git clone https://github.com/T00f-io/career-copilot.git
cd career-copilot

# Install
npm install

# Dev server
npm run dev

# Deploy to GitHub Pages
npm run deploy
```

### Environment

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_publishable_key
VITE_WORKER_URL=your_cloudflare_worker_url
```

The Cloudflare Worker holds the Anthropic API key as a secret. It is never exposed in the frontend bundle.

---

## Portfolio Notes

This project demonstrates end-to-end AI product engineering:

- React component architecture and state management
- PostgreSQL relational schema design with row-level security
- Claude API prompt engineering across five distinct use cases
- Cloudflare Worker secure API-proxy pattern
- Structured-output design and defensive JSON parsing
- Integrity-first prompt design — evidence-backed output, no fabrication
- Single source of truth assembled consistently for every feature

Built independently from zero. Single-user by design.

---

Built by [@T00f-io](https://github.com/T00f-io) · React · Supabase · Claude API · Cloudflare Workers
