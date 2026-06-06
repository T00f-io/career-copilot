import { useState } from 'react'
import { buildVaultContext } from '../lib/vaultContext'
import { askClaude } from '../lib/claude'
import { supabase } from '../lib/supabase'
import FitReport from './FitReport'

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

function Analyzer() {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [saveNote, setSaveNote] = useState('')

  async function handleAnalyze() {
    setError('')
    setResult(null)
    setSaveNote('')

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

      // Persist to Supabase for History
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
    </div>
  )
}

export default Analyzer