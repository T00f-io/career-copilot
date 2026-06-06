// Renders a structured analysis object as a Fit Report.

function scoreColor(score) {
  if (score >= 70) return 'text-green-400'
  if (score >= 45) return 'text-amber-400'
  return 'text-red-400'
}

function scoreRing(score) {
  if (score >= 70) return 'border-green-500/40'
  if (score >= 45) return 'border-amber-500/40'
  return 'border-red-500/40'
}

function recBadge(rec) {
  const r = (rec || '').toLowerCase()
  if (r.includes('strong')) return 'bg-green-500/15 text-green-300 border-green-500/30'
  if (r.includes('worth')) return 'bg-green-500/10 text-green-300 border-green-500/25'
  if (r.includes('stretch')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  return 'bg-red-500/15 text-red-300 border-red-500/30'
}

function List({ items, tone = 'default' }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-zinc-500 italic">None identified.</p>
  }
  const dot =
    tone === 'gap' ? 'bg-red-400' : tone === 'strength' ? 'bg-green-400' : 'bg-zinc-500'
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function FitReport({ result }) {
  if (!result) return null

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      {/* Header: score + recommendation */}
      <div className="flex items-center gap-6 p-6 border-b border-zinc-800">
        <div
          className={`flex flex-col items-center justify-center h-24 w-24 rounded-full border-4 ${scoreRing(result.fit_score)} shrink-0`}
        >
          <span className={`text-3xl font-bold ${scoreColor(result.fit_score)}`}>
            {result.fit_score}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">Fit</span>
        </div>
        <div className="min-w-0">
          {result.recommendation && (
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-medium mb-2 ${recBadge(result.recommendation)}`}
            >
              {result.recommendation}
            </span>
          )}
          <p className="text-sm text-zinc-300 leading-relaxed">{result.fit_summary}</p>
        </div>
      </div>

      {/* Body sections */}
      <div className="grid md:grid-cols-2 gap-px bg-zinc-800">
        <section className="bg-zinc-900/40 p-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Your Strengths for This Role
          </h3>
          <List items={result.strengths} tone="strength" />
        </section>

        <section className="bg-zinc-900/40 p-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            Top Skills This Role Prioritizes
          </h3>
          <List items={result.top_skills_prioritized} />
        </section>

        <section className="bg-zinc-900/40 p-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Must-Have Gaps
          </h3>
          <List items={result.must_have_gaps} tone="gap" />
        </section>

        <section className="bg-zinc-900/40 p-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Nice-to-Have Gaps
          </h3>
          <List items={result.nice_to_have_gaps} tone="gap" />
        </section>
      </div>
    </div>
  )
}

export default FitReport