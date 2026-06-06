import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FitReport from './FitReport'

function scoreColor(score) {
  if (score >= 70) return 'text-green-400'
  if (score >= 45) return 'text-amber-400'
  return 'text-red-400'
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadAnalyses()
  }, [])

  async function loadAnalyses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(`Load error: ${error.message}`)
    } else {
      setAnalyses(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(id, e) {
    e.stopPropagation() // don't toggle expand when deleting
    const { error } = await supabase.from('analyses').delete().eq('id', id)
    if (error) {
      setError(`Delete error: ${error.message}`)
    } else {
      if (expandedId === id) setExpandedId(null)
      await loadAnalyses()
    }
  }

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8">
        <p className="text-sm text-zinc-400">Loading history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8">
        <p className="text-sm text-zinc-500">
          No analyses yet. Run one from the Analyzer and it'll show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {analyses.map((a) => {
        const isExpanded = expandedId === a.id
        return (
          <div
            key={a.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden"
          >
            {/* Row header */}
            <div
              onClick={() => toggleExpand(a.id)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-900/70 transition-colors"
            >
              <span className={`text-2xl font-bold w-12 text-center shrink-0 ${scoreColor(a.fit_score)}`}>
                {a.fit_score ?? '—'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {a.job_title || 'Untitled role'}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {a.company || 'Unknown company'} · {formatDate(a.created_at)}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(a.id, e)}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors shrink-0"
              >
                Delete
              </button>
              <span className="text-zinc-500 text-xs shrink-0">
                {isExpanded ? '▲' : '▼'}
              </span>
            </div>

            {/* Expanded report */}
            {isExpanded && (
              <div className="border-t border-zinc-800 p-4">
                {a.analysis_json ? (
                  <FitReport result={a.analysis_json} />
                ) : (
                  <p className="text-sm text-zinc-500">No detailed report stored.</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default History