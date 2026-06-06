# Career Copilot

**An AI-powered job-fit analyzer and resume optimizer that works only from real, documented experience — it highlights and reframes, it never fabricates.**

Career Copilot analyzes a job description against a structured "vault" of your background, returns an honest fit score with a gap breakdown, and generates evidence-based resume suggestions. A second mode evaluates Upwork gigs and drafts client proposals under strict integrity and voice constraints.

Built full-stack with a React frontend, a Supabase database, and the Claude API accessed through a Cloudflare Worker proxy.

---

## Why I built it

Job and freelance applications are slow and guesswork-heavy. I wanted a tool that gives a straight answer — am I a fit, where are the gaps, and how do I present my real experience better for *this* role — without the inflation that makes AI-generated applications hollow.

The hard constraint shaped the whole design: **the tool cannot lie.** Every claim it surfaces must trace to something I actually documented. That principle is enforced in the prompts, not just hoped for.

It also doubles as applied AI-engineering evidence: prompt design for structured output, a secure API-proxy pattern, a database with row-level security, and a React UI that turns model responses into a usable product.

---

## Features

### Job application mode
- **Resume Vault** — resume text, work history, projects, education, and skills stored in Supabase as the single source of truth the AI reasons from.
- **Job Analyzer** — paste a job description; the vault is assembled into a structured context block and analyzed against the role.
- **Fit Report** — honest fit score, plain-spoken summary, must-have vs nice-to-have gaps, the skills the role prioritizes, and evidence-backed strengths.
- **Resume Optimizer** — bullet-level reframes (same facts, sharper framing) plus surfacing of *undersold* experience already in the vault, each suggestion citing its evidence.
- **Analysis History** — every analysis saved and revisitable, to compare fit across roles over time.

### Freelance mode (Upwork)
- **Gig Verdict** — applies a send-or-skip framework (hard filters, green lights, red flags, stretch-bid logic) and returns a clear recommendation rather than vague encouragement. Missing data is marked *unknown*, never assumed to pass.
- **Cover Letter Generator** — drafts a client-ready proposal under hard voice and integrity rules, with copy-to-clipboard, screening-question answers, and tactical notes.

### Cross-cutting
- **Plain-English project capture** — brain-dump a side project in natural language; the model structures it into clean fields for review before saving.
- **Store rich, output brief** — the vault holds full structured detail for accurate comparison; generated bullets and proposals apply smart brevity and speak only to what was actually produced.

---

## Architecture

```
React (Vite + Tailwind)
        |
        |  assembles vault into a structured context block
        v
Cloudflare Worker  ──>  Claude API
   (proxy; API key       (analysis, optimization,
    held as a secret)     gig verdicts, drafting)
        |
        v
   Supabase (PostgreSQL + Row-Level Security)
   resume · work history · projects · education · skills · analyses
```

**Request flow:** the React app pulls the vault from Supabase, assembles it into a single structured prompt context, and sends it to a Cloudflare Worker. The Worker attaches the Anthropic API key server-side and forwards the request to Claude, so the key never ships in the frontend bundle. Structured JSON comes back, gets parsed, and renders as a report.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Database | Supabase (PostgreSQL + Row-Level Security) |
| AI | Claude API (`claude-sonnet-4-5`) |
| API proxy | Cloudflare Workers |
| Hosting | GitHub Pages |

---

## Engineering decisions worth calling out

- **API key never touches the client.** A Cloudflare Worker proxies every Claude call with the key stored as a Worker secret. The browser only ever talks to the Worker.
- **Integrity enforced in the prompt layer.** System prompts require every claim to trace to documented experience, forbid inventing metrics, and distinguish proven LLM *integration* work from model building. Resume bullets and proposals are reframes of real experience, never fabrications.
- **Structured JSON output, defensively parsed.** The model is constrained to a fixed JSON shape so the UI can render reliably; parsing strips stray markdown fences and fails loudly rather than silently when output is malformed.
- **Single source of truth.** The vault is assembled the same way for every feature, so the Analyzer, Optimizer, and freelance mode all reason from identical, deduplicated context.
- **Row-Level Security on every table** as a deliberate default, with the Worker proxy as the key boundary.

---

## Project status

Fully functional and in active personal use. Built across a planned sprint sequence covering scaffold, database, the Resume Vault, the Claude proxy, the Analyzer and Fit Report, the Optimizer, Analysis History, and freelance mode, plus a vault expansion adding projects, education, and plain-English capture.

---

## Notes

Single-user by design. Built as both a working tool and a portfolio demonstration of applied AI engineering.
