import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const BLANK = { company: '', title: '', start_date: '', end_date: '', description: '' }

function WorkHistorySection() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadRoles()
  }, [])

  async function loadRoles() {
    const { data, error } = await supabase
      .from('work_history')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(`Load error: ${error.message}`)
    } else {
      setRoles(data || [])
    }
    setLoading(false)
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function startEdit(role) {
    setEditingId(role.id)
    setForm({
      company: role.company || '',
      title: role.title || '',
      start_date: role.start_date || '',
      end_date: role.end_date || '',
      description: role.description || '',
    })
    setMessage('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(BLANK)
    setMessage('')
  }

  async function handleSave() {
    if (!form.company.trim() || !form.title.trim()) {
      setMessage('Company and title are required.')
      return
    }
    setSaving(true)
    setMessage('')

    if (editingId) {
      const { error } = await supabase
        .from('work_history')
        .update(form)
        .eq('id', editingId)
      if (error) {
        setMessage(`Save error: ${error.message}`)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('work_history').insert(form)
      if (error) {
        setMessage(`Save error: ${error.message}`)
        setSaving(false)
        return
      }
    }

    setForm(BLANK)
    setEditingId(null)
    setSaving(false)
    await loadRoles()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('work_history').delete().eq('id', id)
    if (error) {
      setMessage(`Delete error: ${error.message}`)
    } else {
      await loadRoles()
    }
  }

  const inputClass =
    'w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600'

  return (
    <div className="space-y-6">
      {/* Add / edit form */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <h3 className="text-sm font-medium">
          {editingId ? 'Edit Role' : 'Add Role'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.company}
            onChange={(e) => updateForm('company', e.target.value)}
            placeholder="Company"
            className={inputClass}
          />
          <input
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            placeholder="Title"
            className={inputClass}
          />
          <input
            value={form.start_date}
            onChange={(e) => updateForm('start_date', e.target.value)}
            placeholder="Start (e.g. Jan 2020)"
            className={inputClass}
          />
          <input
            value={form.end_date}
            onChange={(e) => updateForm('end_date', e.target.value)}
            placeholder="End (e.g. Present)"
            className={inputClass}
          />
        </div>
        <textarea
          value={form.description}
          onChange={(e) => updateForm('description', e.target.value)}
          rows={4}
          placeholder="Responsibilities, achievements, metrics..."
          className={`${inputClass} resize-y`}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-white text-zinc-950 px-4 py-2 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : editingId ? 'Update Role' : 'Add Role'}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
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

      {/* List of roles */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-400 px-1">Loading...</p>
        ) : roles.length === 0 ? (
          <p className="text-sm text-zinc-500 px-1">No roles added yet.</p>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{role.title}</p>
                  <p className="text-sm text-zinc-400">{role.company}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {role.start_date}{role.start_date && role.end_date ? ' — ' : ''}{role.end_date}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(role)}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {role.description && (
                <p className="text-sm text-zinc-300 mt-3 whitespace-pre-wrap">
                  {role.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default WorkHistorySection