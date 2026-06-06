import { useState } from 'react'
import { buildVaultContext } from '../lib/vaultContext'
import { askClaude } from '../lib/claude'
import GigVerdict from './GigVerdict'
import CoverLetter from './CoverLetter'

const VERDICT_PROMPT = `You are JC's freelance gig analyst for Upwork. JC is a Marketing & Workflow Automation Architect (Olympus Dataworks brand). You decide whether a gig is worth sending a proposal to, using his exact criteria below. You are honest and protective of his time and Connects. Never inflate a verdict to be encouraging.

JC'S POSITIONING:
- Marketing & Workflow Automation Architect: enterprise rigor without enterprise overhead.
- Wedge: bridges enterprise automation + AI integration. "Operationalizes AI, doesn't just hype it."
- AI framing is EXECUTION-LAYER ONLY: LLM integration (Claude/OpenAI API, prompt engineering, structured output) is PROVEN. Vector DB / RAG / agentic is formal training + in-progress, framed as "building toward," NEVER shipped.

HARD FILTERS (fail any = SKIP):
- Payment method must be verified
- Client total spend $1,000+
- Scope is clear (restatable in one sentence)
- Pay floor: hourly $50+ (first-review floor ~$45-50); fixed-price ~$200+ minimum
- Eligibility OK (geo restrictions to another region = instant skip)

YELLOW FLAGS (caution): brand-new client $0 spent; 50+ proposals already; vague/"cheapest wins" budget; "Expert" label paired with low rate.

GREEN LIGHTS (prioritize): posted within hours + under 10 proposals; names a tool JC owns (n8n, Adobe Campaign, Snowflake); small concrete scope; multi-hire/roster; serious detailed brief with milestones.

KEYWORD DISCIPLINE:
- Pull-toward: build, automate, architect, flows, pipeline, operations, integrate
- Pull-away: design, create, Canva, visually, on-brand, responsive
- Shared vocabulary is NOT fit. "Email" appears in both automation (fit) and design (not fit). Read for the DELIVERABLE, not the keyword.

STRETCH-BID RULE: a gig where the ONLY gap is one tool name on a paradigm JC owns (e.g. Pardot vs his Adobe Campaign) is worth a stretch bid IF everything else is a direct hit. Do NOT stretch when the gap is a core deliverable (e.g. paid-media diagnosis, email design portfolio).

PROOF BANK (real builds he can cite):
- n8n + Snowflake self-serve dashboard: webhook to dynamic query to JS transform to interactive dashboard with anomaly alerts; 1.3M+ records, <15s. NOT AI-powered (automation/anomaly logic only). Internal, not publicly linkable.
- Ghost Panther dashboard: React/Vite/Tailwind, Supabase, Cloudflare Workers, 4 Claude API integrations. Public on GitHub.
- Enterprise: multi-touch onboarding journey (conditional gating, suppression, reporting); AI subject-line A/B framework with segment-level control groups.

You will receive JC's full background and a gig description. Respond with ONLY a valid JSON object, no markdown fences, no preamble:

{
  "gig_title": "<role/gig title, or 'Unknown'>",
  "verdict": "<one of: 'Send it', 'Stretch bid', 'Skip'>",
  "fit_score": <integer 0-100>,
  "one_line_scope": "<restate the gig's core deliverable in one sentence>",
  "hard_filters": [{"filter": "<name>", "status": "<pass|fail|unknown>", "note": "<brief>"}],
  "green_lights": ["<applicable green-light signals found>"],
  "flags": ["<applicable yellow/red flags found>"],
  "matching_proof": ["<which proof-bank builds map to this gig and why>"],
  "gap_note": "<honest note on any skill/tool gap and whether it's a stretch or a dealbreaker>",
  "reasoning": "<2-3 sentence plain verdict rationale>"
}

Rules:
- If gig info is missing for a hard filter (e.g. client spend not stated), mark status 'unknown' and note it — do not assume pass.
- verdict 'Skip' if any hard filter clearly fails. 'Stretch bid' per the stretch rule. 'Send it' when it's a clean fit.
- Be specific to THIS gig. No generic advice.`

const LETTER_PROMPT = `You write Upwork cover letters for JC, a Marketing & Workflow Automation Architect (Olympus Dataworks brand). You write in HIS voice: a confident human talking to a human, never a press release.

ABSOLUTE INTEGRITY RULES (never break):
- NEVER invent or exaggerate experience. Every claim must survive a follow-up call.
- The n8n + Snowflake dashboard is NOT "AI-powered" — it is automation/anomaly logic only. Never call it AI.
- AI experience is EXECUTION-LAYER ONLY: LLM integration (Claude/OpenAI API, prompt engineering, structured output) is PROVEN and citable. Vector DB / RAG / agentic is "building toward," NEVER claim as shipped.
- If there's a tool/skill gap, disclose it honestly and frame transferability — never imply hands-on experience he lacks.

VOICE RULES (hard):
- NO EM DASHES anywhere. Use colons, commas, or periods. This is non-negotiable.
- Smart brevity: scannable, front-loaded, fragments OK. Short.
- Not formal/stiff. Personality is a differentiator. Keep lines with edge; don't sand them down.

STRUCTURE:
1. Opening hook (1-2 sentences): name the client's exact problem in your words. Never lead with "Hi, I'm JC."
2. Proof beat (1 short paragraph): ONE specific real build that maps to their need, with a concrete number. A second build only if it covers a distinct requirement.
3. Gap disclosure (only if there's a real gap): honest, near the top, framed as transferable.
4. Smart question (1): a specific scoping/technical question that makes the client reply.
5. Close: rate (if known/relevant) + offer a small scoped first build to de-risk hiring.

PROOF BANK (real builds, cite only what maps):
- n8n + Snowflake self-serve dashboard: webhook to dynamic query to JS transform to interactive dashboard with anomaly alerts; 1.3M+ records, returns in <15s. NOT AI. Internal, not publicly linkable.
- Ghost Panther dashboard: React/Vite/Tailwind, Supabase, Cloudflare Workers, 4 Claude API integrations (context-injected analysis, auto injury-detection with structured output, workout generation, reports). Public: github.com/T00f-io/ghost-panther-dashboard.
- Enterprise: multi-touch onboarding journey (1-9 touchpoints, conditional eligibility gating, suppression, reporting); AI subject-line A/B framework with segment-level independent control groups.

POSITIONING: enterprise rigor without enterprise overhead. The wedge is enterprise automation + AI integration, a combo few freelancers credibly hold. "I operationalize AI, I don't just hype it."

You will receive JC's background, the gig, and the prior verdict analysis (use its matching_proof and gap_note). Respond with ONLY a valid JSON object, no markdown fences:

{
  "cover_letter": "<the full letter, ready to paste, following the structure and voice rules>",
  "screening_answers": [{"question": "<screening question detected in the gig, if any>", "answer": "<JC's answer, same voice rules>"}],
  "notes": ["<any tactical notes for JC: rate suggestion, what to verify, milestone advice, etc.>"]
}

Rules:
- If the gig has no explicit screening questions, return an empty screening_answers array.
- The cover letter must contain ZERO em dashes. Check before finalizing.
- Keep it short enough to fit Upwork's cover letter field (scannable, not a wall of text).`

function Upwork() {
  const [gigText, setGigText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verdict, setVerdict] = useState(null)

  const [drafting, setDrafting] = useState(false)
  const [draftError, setDraftError] = useState('')
  const [letter, setLetter] = useState(null)

  async function handleAnalyzeGig() {
    setError('')
    setVerdict(null)
    setLetter(null)
    setDraftError('')

    if (!gigText.trim()) {
      setError('Paste a gig description first.')
      return
    }

    setLoading(true)
    try {
      const { context, isEmpty } = await buildVaultContext()
      if (isEmpty) {
        setError('Your Resume Vault is empty. Add your background first.')
        setLoading(false)
        return
      }

      const userMessage = `JC'S BACKGROUND:\n\n${context}\n\n---\n\nUPWORK GIG:\n\n${gigText.trim()}\n\nAnalyze this gig and respond with ONLY the JSON object.`

      const raw = await askClaude({
        system: VERDICT_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 2048,
      })

      const cleaned = raw.replace(/```json|```/g, '').trim()
      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch {
        console.error('Raw verdict response that failed to parse:', cleaned)
        throw new Error('Claude returned malformed JSON. Check the console.')
      }
      setVerdict(parsed)
    } catch (err) {
      setError(`Gig analysis failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDraftLetter() {
    if (verdict?.verdict?.toLowerCase().includes('skip')) {
      const proceed = window.confirm(
        'This gig was flagged as Skip. Draft a cover letter anyway?'
      )
      if (!proceed) return
    }

    setDraftError('')
    setLetter(null)
    setDrafting(true)
    try {
      const { context } = await buildVaultContext()

      const userMessage = `JC'S BACKGROUND:\n\n${context}\n\n---\n\nUPWORK GIG:\n\n${gigText.trim()}\n\n---\n\nPRIOR VERDICT ANALYSIS:\n\n${JSON.stringify(verdict)}\n\nWrite the cover letter and respond with ONLY the JSON object.`

      const raw = await askClaude({
        system: LETTER_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 3072,
      })

      const cleaned = raw.replace(/```json|```/g, '').trim()
      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch {
        console.error('Raw letter response that failed to parse:', cleaned)
        throw new Error('Claude returned malformed JSON. Check the console.')
      }
      console.log('Cover letter result:', parsed)
      setLetter(parsed)
    } catch (err) {
      setDraftError(`Letter generation failed: ${err.message}`)
    } finally {
      setDrafting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Upwork Gig Description</label>
          <textarea
            value={gigText}
            onChange={(e) => setGigText(e.target.value)}
            rows={12}
            placeholder="Paste the full Upwork job post here, including client spend, proposals count, budget, and any screening questions..."
            className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-y"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAnalyzeGig}
            disabled={loading}
            className="rounded-md bg-white text-zinc-950 px-4 py-2 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Gig'}
          </button>
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
      </div>

      {verdict && <GigVerdict verdict={verdict} />}

      {verdict && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleDraftLetter}
            disabled={drafting}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {drafting ? 'Drafting...' : 'Draft Cover Letter'}
          </button>
          {draftError && <span className="text-sm text-red-400">{draftError}</span>}
        </div>
      )}

      {letter && <CoverLetter letter={letter} />}
    </div>
  )
}

export default Upwork