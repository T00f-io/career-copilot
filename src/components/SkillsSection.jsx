import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function SkillsSection() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSkills()
  }, [])

  async function loadSkills() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      setMessage(`Load error: ${error.message}`)
    } else {
      setSkills(data || [])
    }
    setLoading(false)
  }

  async function handleAdd() {
    if (!name.trim()) {
      setMessage('Skill name is required.')
      return
    }
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('skills')
      .insert({ name: name.trim(), category: category.trim() || null })

    if (error) {
      setMessage(`Save error: ${error.message}`)
    } else {
      setName('')
      setCategory('')
      await loadSkills()
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) {
      setMessage(`Delete error: ${error.message}`)
    } else {
      await loadSkills()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  const inputClass =
    'rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600'

  // Group skills by category for display
  const grouped = skills.reduce((acc, skill) => {
    const key = skill.category || 'Uncategorized'
    if (!acc[key]) acc[key] = []
    acc[key].push(skill)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <h3 className="text-sm font-medium">Add Skill</h3>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skill (e.g. SQL)"
            className={`${inputClass} flex-1`}
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Category (optional, e.g. Tool)"
            className={`${inputClass} flex-1`}
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="rounded-md bg-white text-zinc-950 px-4 py-2 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors shrink-0"
          >
            {saving ? 'Adding...' : 'Add'}
          </button>
        </div>
        {message && (
          <span className={`text-sm ${message.includes('error') || message.includes('required') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </span>
        )}
      </div>

      {/* Grouped list */}
      <div className="space-y-5">
        {loading ? (
          <p className="text-sm text-zinc-400 px-1">Loading...</p>
        ) : skills.length === 0 ? (
          <p className="text-sm text-zinc-500 px-1">No skills added yet.</p>
        ) : (
          Object.keys(grouped).map((cat) => (
            <div key={cat}>
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-2">
                {cat}
              </h4>
              <div className="flex flex-wrap gap-2">
                {grouped[cat].map((skill) => (
                  <span
                    key={skill.id}
                    className="group inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm"
                  >
                    {skill.name}
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                      aria-label={`Delete ${skill.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SkillsSection