// Renders an Upwork gig verdict.

function verdictBadge(verdict) {
  const v = (verdict || '').toLowerCase()
  if (v.includes('send')) return 'bg-green-500/15 text-green-300 border-green-500/30'
  if (v.includes('stretch')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  return 'bg-red-500/15 text-red-300 border-red-500/30'
}

function scoreColor(score) {
  if (score >= 70) return 'text-green-400'
  if (score >= 45) return 'text-amber-400'
  return 'text-red-400'
}

function filterDot(status) {
  if (status === 'pass') return 'bg-green-400'
  if (status === 'fail') return 'bg-red-400'
  return 'bg-zinc-500'
}

function GigVerdict({ verdict }) {
  if (!verdict) return null

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-6 p-6 border-b border-zinc-800">
        <div className="flex flex-col items-center justify-center shrink-0">
          <span className={`text-3xl font-bold ${scoreColor(verdict.fit_score)}`}>
            {verdict.fit_score}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">Fit</span>
        </div>
        <div className="min-w-0">
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-medium mb-2 ${verdictBadge(verdict.verdict)}`}
          >
            {verdict.verdict}
          </span>
          <p className="text-sm text-zinc-300 leading-relaxed">{verdict.reasoning}</p>
          {verdict.one_line_scope && (
            <p className="text-xs text-zinc-500 mt-2">
              <span className="text-zinc-400">Scope: </span>
              {verdict.one_line_scope}
            </p>
          )}
        </div>
      </div>

      {/* Hard filters */}
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-sm font-medium mb-3">Hard Filters</h3>
        <div className="space-y-2">
          {(verdict.hard_filters || []).map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${filterDot(f.status)}`} />
              <span className="text-zinc-300">{f.filter}</span>
              <span className="text-zinc-600">·</span>
              <span className={`text-xs uppercase tracking-wide ${
                f.status === 'pass' ? 'text-green-400' : f.status === 'fail' ? 'text-red-400' : 'text-zinc-500'
              }`}>
                {f.status}
              </span>
              {f.note && <span className="text-xs text-zinc-500 truncate">— {f.note}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: green lights / flags */}
      <div className="grid md:grid-cols-2 gap-px bg-zinc-800">
        <section className="bg-zinc-900/40 p-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Green Lights
          </h3>
          {(verdict.green_lights || []).length === 0 ? (
            <p className="text-sm text-zinc-500 italic">None found.</p>
          ) : (
            <ul className="space-y-2">
              {verdict.green_lights.map((g, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-zinc-900/40 p-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Flags
          </h3>
          {(verdict.flags || []).length === 0 ? (
            <p className="text-sm text-zinc-500 italic">None found.</p>
          ) : (
            <ul className="space-y-2">
              {verdict.flags.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Matching proof + gap */}
      <div className="p-6 border-t border-zinc-800 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Matching Proof
          </h3>
          {(verdict.matching_proof || []).length === 0 ? (
            <p className="text-sm text-zinc-500 italic">No direct proof mapped.</p>
          ) : (
            <ul className="space-y-2">
              {verdict.matching_proof.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {verdict.gap_note && (
          <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Gap Note</p>
            <p className="text-sm text-zinc-300">{verdict.gap_note}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GigVerdict