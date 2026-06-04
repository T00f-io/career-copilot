import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('Checking connection...')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    async function testConnection() {
      // Query the skills table — empty is fine, we just want a clean response
      const { error } = await supabase.from('skills').select('*').limit(1)

      if (error) {
        setStatus(`Connection failed: ${error.message}`)
        setIsError(true)
      } else {
        setStatus('Connected to Supabase ✓')
        setIsError(false)
      }
    }
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight">
            Career Copilot
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            AI job fit analyzer & resume optimizer
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8">
          <h2 className="text-lg font-medium">Sprint 2 — Backend</h2>
          <p className={`text-sm mt-2 ${isError ? 'text-red-400' : 'text-zinc-400'}`}>
            {status}
          </p>
        </div>
      </main>
    </div>
  )
}

export default App