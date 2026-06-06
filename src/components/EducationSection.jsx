import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const BLANK = { institution: '', credential: '', field: '', start_date: '', end_date: '', details: '' }

function EducationSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(`Load error: ${error.message}`)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm({
      institution: item.institution || '',
      credential: item.credential || '',
      field: item.field || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      details: item.details || '',
    })
    setMessage('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(BLANK)
    setMessage('')
  }

  async function handleSave() {
    if (!form.institution.trim()) {
      setMessage('Institution is required.')
      return
    }
    setSaving(true)
    setMessage('')

    if (editingId) {
      const { error } = await supabase.from('education').update(form).eq('id', editingId)
      if (error) {
        setMessage(`Save error: ${error.message}`)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('education').insert(form)
      if (error) {
        setMessage(`Save error: ${error.message}`)
        setSaving(false)
        return
      }
    }

    setForm(BLANK)
    setEditingId(null)
    setSaving(false)
    await loadItems()
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('education').delete().eq('id', id)
    if (error) {
      setMessage(`Delete error: ${error.message}`)
    } else {
      await loadItems()
    }
  }

  const inputClass =
    'w-full rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600'

  return (
    <div className="space-y-6">
      {/* Add / edit form */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <h3 className="text-sm font-medium">{editingId ? 'Edit Education' : 'Add Education'}</h3>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.institution} onChange={(e) => updateForm('institution', e.target.value)} placeholder="Institution" className={inputClass} />
          <input value={form.credential} onChange={(e) => updateForm('credential', e.target.value)} placeholder="Credential (e.g. M.S., Certificate)" className={inputClass} />
          <input value={form.field} onChange={(e) => updateForm('field', e.target.value)} placeholder="Field (e.g. Agentic AI Systems)" className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.start_date} onChange={(e) => updateForm('start_date', e.target.value)} placeholder="Start" className={inputClass} />
            <input value={form.end_date} onChange={(e) => updateForm('end_date', e.target.value)} placeholder="End / Expected" className={inputClass} />
          </div>
        </div>
        <textarea value={form.details} onChange={(e) => updateForm('details', e.target.value)} rows={3} placeholder="Details: focus areas, honors, relevant coursework (optional)" className={`${inputClass} resize-y`} />

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="rounded-md bg-white text-zinc-950 px-4 py-2 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : editingId ? 'Update Education' : 'Add Education'}
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

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-400 px-1">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500 px-1">No education added yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">
                    {[item.credential, item.field].filter(Boolean).join(', ') || item.institution}
                  </p>
                  <p className="text-sm text-zinc-400">{item.institution}</p>
                  {(item.start_date || item.end_date) && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {item.start_date}{item.start_date && item.end_date ? ' – ' : ''}{item.end_date}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(item)} className="text-xs text-zinc-400 hover:text-white transition-colors">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">Delete</button>
                </div>
              </div>
              {item.details && <p className="text-sm text-zinc-300 mt-3 whitespace-pre-wrap">{item.details}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default EducationSection