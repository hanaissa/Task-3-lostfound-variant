import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }
const categories = ['electronics', 'clothing', 'documents', 'accessories', 'other']
const statuses = ['lost', 'found', 'claimed']

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false
    async function loadItem() {
      setError('')
      try {
        const res = await api.get('/items/' + id)
        if (!cancelled) setForm({ ...defaults, ...res.data.item })
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Unable to load item')
      }
    }

    loadItem()
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      title: form.title,
      status: form.status,
      category: form.category,
      location: form.location,
      description: form.description
    }

    try {
      if (id) await api.patch('/items/' + id, payload)
      else await api.post('/items', payload)
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save item')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1 text-sm font-medium">
          <span>Title</span>
          <input className="input" name="title" value={form.title} onChange={onChange} required minLength={2} />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Status</span>
          <select className="input" name="status" value={form.status} onChange={onChange}>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Category</span>
          <select className="input" name="category" value={form.category} onChange={onChange}>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Location <span className="font-normal text-zinc-500">(optional)</span></span>
          <input className="input" name="location" value={form.location} onChange={onChange} />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Description <span className="font-normal text-zinc-500">(optional)</span></span>
          <textarea className="input" name="description" value={form.description} onChange={onChange} rows={4} />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
