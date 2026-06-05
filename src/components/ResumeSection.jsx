import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function ResumeSection() {
  const [rowId, setRowId] = useState(null)
  const [summary, setSummary] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Load the single resume_vault row on mount
  useEffect(() => {
    async function loadResume() {
      const { data, error } = await supabase
        .from('resume_vault')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) {
        setMessage(`Load error: ${error.message}`)
      } else if (data) {
        setRowId(data.id)
        setSummary(data.summary || '')
        setResumeText(data.full_resume_text || '')
      }
      setLoading(false)
    }
    loadResume()
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage('')

    if (rowId) {
      // Update existing row
      const { error } = await supabase
        .from('resume_vault')
        .update({
          summary,
          full_resume_text: resumeText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rowId)

      if (error) {
        setMessage(`Save error: ${error.message}`)
      } else {
        setMessage('Saved ✓')
      }
    } else {
      // Insert first row
      const { data, error } = await supabase
        .from('resume_vault')
        .insert({ summary, full_resume_text: resumeText })
        .select()
        .single()

      if (error) {
        setMessage(`Save error: ${error.message}`)
      } else {
        setRowId(data.id)
        setMessage('Saved ✓')
      }
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Professional Summary
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="A short summary of who you are professionally..."
          className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Full Resume Text
        </label>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={16}
          placeholder="Paste your complete resume text here. This is the source of truth the AI works from."
          className="w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-y font-mono"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-white text-zinc-950 px-4 py-2 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Resume'}
        </button>
        {message && (
          <span className={`text-sm ${message.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  )
}

export default ResumeSection