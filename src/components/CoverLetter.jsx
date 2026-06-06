import { useState } from 'react'

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0"
    >
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

function CoverLetter({ letter }) {
  if (!letter) return null

  const screening = letter.screening_answers || []
  const notes = letter.notes || []

  return (
    <div className="space-y-6">
      {/* The letter */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Cover Letter
          </h3>
          <CopyButton text={letter.cover_letter || ''} label="Copy letter" />
        </div>
        <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
          {letter.cover_letter}
        </p>
      </div>

      {/* Screening answers */}
      {screening.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            Screening Answers
          </h3>
          <div className="space-y-5">
            {screening.map((s, i) => (
              <div key={i}>
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <p className="text-sm text-zinc-400 font-medium">{s.question}</p>
                  <CopyButton text={s.answer || ''} />
                </div>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {s.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tactical notes */}
      {notes.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Tactical Notes
          </h3>
          <ul className="space-y-2">
            {notes.map((n, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CoverLetter