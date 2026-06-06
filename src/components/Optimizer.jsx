// Renders resume optimization suggestions: reframes + undersold experience.

function Optimizer({ optimization }) {
  if (!optimization) return null

  const reframes = optimization.reframes || []
  const undersold = optimization.undersold || []

  return (
    <div className="space-y-6">
      {/* Reframes */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          Reframe Suggestions
        </h3>
        <p className="text-xs text-zinc-500 mb-5">
          Same facts, sharper framing for this role.
        </p>

        {reframes.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No reframes suggested.</p>
        ) : (
          <div className="space-y-5">
            {reframes.map((r, i) => (
              <div key={i} className="border-l-2 border-zinc-700 pl-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Current</p>
                <p className="text-sm text-zinc-400 mb-3 line-through decoration-zinc-600/60">
                  {r.original}
                </p>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Suggested</p>
                <p className="text-sm text-white mb-2">{r.suggested}</p>
                <p className="text-xs text-blue-300/80 italic">{r.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Undersold */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Undersold Experience
        </h3>
        <p className="text-xs text-zinc-500 mb-5">
          Real experience in your vault worth surfacing for this role.
        </p>

        {undersold.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">Nothing flagged as undersold.</p>
        ) : (
          <div className="space-y-5">
            {undersold.map((u, i) => (
              <div key={i} className="border-l-2 border-green-500/30 pl-4">
                <p className="text-sm text-white font-medium mb-1.5">{u.item}</p>
                <p className="text-sm text-zinc-400 mb-2">{u.why}</p>
                <p className="text-xs text-zinc-500">
                  <span className="text-green-400/70">Evidence: </span>
                  {u.evidence}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Optimizer