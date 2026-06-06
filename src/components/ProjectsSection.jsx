import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { askClaude } from '../lib/claude'

const BLANK = { name: '', role: '', stack: '', problem: '', what_i_built: '', outcome: '', link: '' }

const PARSE_PROMPT = `You parse a freeform description of a project into structured fields for JC's portfolio vault. JC describes projects in plain English, often rambling. Your job is to extract and organize, NOT to embellish.

INTEGRITY RULES (absolute):
- Capture ONLY what JC actually states or clearly implies. Never invent details, numbers, or outcomes.
- If something is in-progress or "building toward," label it that way, never as shipped.
- For AI work, distinguish LLM integration (calling an API, prompt engineering, structured output) from model building/training. Do not blur them.
- If a field has no information in the description, return an empty string for it. Do not pad or guess.

Respond with ONLY a valid JSON object, no markdown fences, no preamble:

{
  "name": "<short project name>",
  "role": "<JC's role, e.g. 'Solo builder', 'Architect', or empty>",
  "stack": "<comma-separated tools/languages/APIs/platforms mentioned>",
  "problem": "<the problem it solves or skill it taught, 1-2 sentences>",
  "what_i_built": "<what JC personally built, specific, honest about what's his vs off-the-shelf>",
  "outcome": "<concrete result or current status, with a number only if JC stated one>",
  "link": "<url if mentioned, else empty>"
}`

function ProjectsSection() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [dump, setDump] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseMessage, setParseMessage] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(`Load error: ${error.message}`)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  async function handleParse() {
    if (!dump.trim()) {
      setParseMessage('Paste a description first.')
      return
    }
    setParsing(true)
    setParseMessage('')
    try {
      const raw = await askClaude({
        system: PARSE_PROMPT,
        messages: [{ role: 'user', content: `Parse this project description:\n\n${dump.trim()}` }],
        maxTokens: 2048,
      })
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      setForm({
        name: parsed.name || '',
        role: parsed.role || '',
        stack: parsed.stack || '',
        problem: parsed.problem || '',
        what_i_built: parsed.what_i_built || '',
        outcome: parsed.outcome || '',
        link: parsed.link || '',
      })
      setEditingId(null)
      setParseMessage('Parsed into the form below. Review, then Add Project.')
    } catch (err) {
      setParseMessage(`Parse failed: ${err.message}`)
    } finally {
      setParsing(false)
    }
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      name: p.name || '',
      role: p.role || '',
      stack: p.stack || '',
      problem: p.problem || '',
      what_i_built: p.what_i_built || '',
      outcome: p.outcome || '',
      link: p.link || '',
    })
    setMessage('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(BLANK)
    setMessage('')
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setMessage('Project name is required.')
      return
    }
    setSaving(true)
    setMessage('')

    if (editingId) {
      const { error } = await supabase.from('projects').update(form).eq('id', editingId)
      if (error) {
        setMessage(`Save error: ${error.message}`)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('projects').insert(form)
      if (error) {
        setMessage(`Save error: ${error.message}`)
        setSaving(false)
        return
      }
    }

    setForm(BLANK)
    setEditingId(null)
    setDump('')
    setParseMessage('')
    setSaving(false)
    await loadProjects()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      setMessage(`Delete error: ${error.message}`)
    } else {
      await loadProjects()
    }
  }

  const inputClass =
    'w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600'

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-6 space-y-3">
        <h3 className="text-sm font-medium">Quick Add from Description</h3>
        <p className="text-xs text-zinc-500">
          Brain-dump the project in plain English. Claude structures it into the fields below for your review.
        </p>
        <textarea
          value={dump}
          onChange={(e) => setDump(e.target.value)}
          rows={5}
          placeholder="e.g. I built an SMS automation that connects our HubSpot CRM to Zapier, ships a customer list to Twilio for SMS follow-ups..."
          className={`${inputClass} resize-y`}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleParse}
            disabled={parsing}
            className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {parsing ? 'Parsing...' : 'Parse with Claude'}
          </button>
          {parseMessage && (
            <span className={`text-sm ${parseMessage.includes('failed') || parseMessage.includes('first') ? 'text-red-400' : 'text-green-400'}`}>
              {parseMessage}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <h3 className="text-sm font-medium">{editingId ? 'Edit Project' : 'Add Project'}</h3>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Project name" className={inputClass} />
          <input value={form.role} onChange={(e) => updateForm('role', e.target.value)} placeholder="Your role (e.g. Solo builder)" className={inputClass} />
        </div>
        <input value={form.stack} onChange={(e) => updateForm('stack', e.target.value)} placeholder="Stack (comma-separated: React, Supabase, Claude API...)" className={inputClass} />
        <textarea value={form.problem} onChange={(e) => updateForm('problem', e.target.value)} rows={2} placeholder="Problem it solves / skill it taught" className={`${inputClass} resize-y`} />
        <textarea value={form.what_i_built} onChange={(e) => updateForm('what_i_built', e.target.value)} rows={4} placeholder="What you personally built (be specific, honest about what's yours vs off-the-shelf)" className={`${inputClass} resize-y`} />
        <textarea value={form.outcome} onChange={(e) => updateForm('outcome', e.target.value)} rows={2} placeholder="Outcome / current status (with a number if one exists)" className={`${inputClass} resize-y`} />
        <input value={form.link} onChange={(e) => updateForm('link', e.target.value)} placeholder="Link (or leave blank if not publicly linkable)" className={inputClass} />

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="rounded-md bg-white text-zinc-950 px-4 py-2 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
          )}
          {message && (
            <span className={`text-sm ${message.includes('error') || message.includes('required') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-400 px-1">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-zinc-500 px-1">No projects added yet.</p>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{p.name}</p>
                  {p.role && <p className="text-sm text-zinc-400">{p.role}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(p)} className="text-xs text-zinc-400 hover:text-white transition-colors">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">Delete</button>
                </div>
              </div>
              {p.stack && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.stack.split(',').map((t, i) => (
                    <span key={i} className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-xs text-zinc-300">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}
              {p.problem && <p className="text-sm text-zinc-300 mt-3"><span className="text-zinc-500">Problem: </span>{p.problem}</p>}
              {p.what_i_built && <p className="text-sm text-zinc-300 mt-2"><span className="text-zinc-500">Built: </span>{p.what_i_built}</p>}
              {p.outcome && <p className="text-sm text-zinc-300 mt-2"><span className="text-zinc-500">Outcome: </span>{p.outcome}</p>}
              {p.link && (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block break-all">
                  {p.link}
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectsSection
