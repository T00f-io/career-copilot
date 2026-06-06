import { useState } from 'react'
import { buildVaultContext } from '../lib/vaultContext'
import { askClaude } from '../lib/claude'
import { supabase } from '../lib/supabase'
import FitReport from './FitReport'
import Optimizer from './Optimizer'

const SYSTEM_PROMPT = `You are an honest, direct AI recruiter analyzing how well a candidate fits a specific job. You work ONLY from the candidate's documented experience provided to you. You never invent, exaggerate, or assume experience that isn't in the candidate's vault. If the candidate lacks something, you say so plainly. Your job is accurate assessment, not flattery.

You will be given the candidate's full background (resume, work history, skills) and a job description. Analyze the fit and respond with ONLY a valid JSON object, no markdown fences, no preamble, in exactly this shape:

{
  "job_title": "<the role title from the job description, or 'Unknown' if unclear>",
  "company": "<the hiring company from the job description, or 'Unknown' if unclear>",
  "fit_score": <integer 0-100, honest overall fit>,
  "fit_summary": "<2-3 sentence plain-spoken assessment of why they do or don't fit>",
  "must_have_gaps": ["<requirements the job treats as essential that the candidate lacks or hasn't documented>"],
  "nice_to_have_gaps": ["<preferred-but-not-essential items the candidate lacks>"],
  "top_skills_prioritized": ["<the skills/qualities this specific role values most, in priority order>"],
  "strengths": ["<the candidate's strongest, evidence-backed selling points for THIS role>"],
  "recommendation": "<one of: 'Strong fit — apply', 'Worth applying', 'Stretch — apply selectively', 'Likely not a fit'>"
}

Rules:
- fit_score must reflect genuine alignment, not optimism. A score of 70+ means clearly qualified.
- Gaps must be real and specific. If there are none in a category, return an empty array.
- Every strength must trace to something actually in the candidate's documented experience.
- Be concise. No fluff.`

const OPTIMIZER_PROMPT = `You are an honest resume optimizer. You help a candidate present their REAL, DOCUMENTED experience more effectively for a specific role. You operate under one absolute rule: you NEVER invent, fabricate, or exaggerate experience. Every suggestion must trace to something actually present in the candidate's documented background. If you cannot support a claim from their vault, you do not make it.

You will receive the candidate's full background, a job description, and a prior fit analysis. Produce two kinds of suggestions:

1. REFRAMES: existing experience rewritten to better speak to THIS role's priorities and language — same facts, sharper framing.
2. UNDERSOLD: real experience already in their vault that is relevant to this role but buried, understated, or missing from how they currently present themselves.

Respond with ONLY a valid JSON object, no markdown fences, no preamble, in exactly this shape:

{
  "reframes": [
    {
      "original": "<the candidate's current phrasing or the relevant documented experience>",
      "suggested": "<a sharper rewrite targeted at this role — same underlying facts>",
      "rationale": "<one line: why this framing lands better for this specific role>"
    }
  ],
  "undersold": [
    {
      "item": "<the real, documented experience being under-leveraged>",
      "why": "<why it matters for THIS role>",
      "evidence": "<where this lives in their vault — which role, skill, or resume section>"
    }
  ]
}

Rules:
- Every reframe must preserve truth. Sharpen language, never inflate facts.
- Every undersold item must cite real evidence from the vault in the 'evidence' field.
- If the vault genuinely lacks material for a category, return an empty array for it. Do not pad.
- Be specific and concise. No generic resume advice.`

function Analyzer() {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [saveNote, setSaveNote] = useState('')

  const [optimizing, setOptimizing] = useState(false)
  const [optimizeError, setOptimizeError] = useState('')
  const [optimization, setOptimization] = useState(null)

  async function handleAnalyze() {
    setError('')
    setResult(null)
    setSaveNote('')
    setOptimization(null)
    setOptimizeError('')

    if (!jobDescription.trim()) {
      setError('Paste a job description first.')
      return
    }

    setLoading(true)
    try {
      const { context, isEmpty } = await buildVaultContext()
      if (isEmpty) {
        setError('Your Resume Vault is empty. Add your resume, work history, or skills first.')
        setLoading(false)
        return
      }

      const userMessage = `CANDIDATE BACKGROUND:\n\n${context}\n\n---\n\nJOB DESCRIPTION:\n\n${jobDescription.trim()}\n\nAnalyze the fit and respond with ONLY the JSON object.`

      const raw = await askClaude({
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 2048,
      })

      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      setResult(parsed)

      const { error: saveError } = await supabase.from('analyses').insert({
        job_title: parsed.job_title || null,
        company: parsed.company || null,
        job_description: jobDescription.trim(),
        fit_score: parsed.fit_score ?? null,
        analysis_json: parsed,
      })

      if (saveError) {
        setSaveNote(`Saved locally, but DB save failed: ${saveError.message}`)
      } else {
        setSaveNote('Analysis saved to history ✓')
      }
    } catch (err) {
      setError(`Analysis failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleOptimize() {
    setOptimizeError('')
    setOptimization(null)
    setOptimizing(true)
    try {
      const { context } = await buildVaultContext()

      const userMessage = `CANDIDATE BACKGROUND:\n\n${context}\n\n---\n\nJOB DESCRIPTION:\n\n${jobDescription.trim()}\n\n---\n\nPRIOR FIT ANALYSIS:\n\n${JSON.stringify(result)}\n\nProduce reframe and undersold suggestions and respond with ONLY the JSON object.`

      const raw = await askClaude({
        system: OPTIMIZER_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 4096,
      })

      const cleaned = raw.replace(/```json|```/g, '').trim()
      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch (parseErr) {
        console.error('Raw optimizer response that failed to parse:', cleaned)
        throw new Error('Claude returned malformed JSON. Check the console for the raw response.')
      }
      console.log('Optimization result:', parsed)
      setOptimization(parsed)
    } catch (err) {
      setOptimizeError(`Optimization failed: ${err.message}`)
    } finally {
      setOptimizing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
            placeholder="Paste the full job description here..."
            className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-y"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-md bg-white text-zinc-950 px-4 py-2 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Fit'}
          </button>
          {error && <span className="text-sm text-red-400">{error}</span>}
          {saveNote && !error && (
            <span className={`text-sm ${saveNote.includes('failed') ? 'text-amber-400' : 'text-green-400'}`}>
              {saveNote}
            </span>
          )}
        </div>
      </div>

      {result && <FitReport result={result} />}

      {result && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {optimizing ? 'Optimizing...' : 'Optimize My Resume'}
          </button>
          {optimizeError && <span className="text-sm text-red-400">{optimizeError}</span>}
        </div>
      )}

      {optimization && <Optimizer optimization={optimization} />}
    </div>
  )
}

export default Analyzer