import { useState } from 'react'
import useApi from '../../hooks/useApi'

export default function FeedbackForm({ onSubmitted }) {
  const { data: pantriesData } = useApi('/api/pantries')
  const pantries = pantriesData?.data || []

  const [form, setForm] = useState({ pantry_name: '', neighborhood: '', rating: 3, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  const handlePantryChange = (name) => {
    const p = pantries.find(p => p.name === name)
    setForm({ ...form, pantry_name: name, neighborhood: p?.neighborhood || '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.pantry_name || !form.comment) return
    setSubmitting(true)
    try {
      const resp = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (resp.ok) {
        const result = await resp.json()
        onSubmitted?.(result.data)
        setForm({ pantry_name: '', neighborhood: '', rating: 3, comment: '' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
      <h3 className="font-serif text-lg mb-4">Submit Feedback</h3>

      <label className="block text-sm text-lt-text-secondary mb-1">Pantry</label>
      <select
        value={form.pantry_name}
        onChange={e => handlePantryChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-md border border-lt-border bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-lt-green/30"
      >
        <option value="">Select a pantry...</option>
        {pantries.map(p => (
          <option key={p.name} value={p.name}>{p.name}</option>
        ))}
      </select>

      {form.neighborhood && (
        <p className="text-xs text-lt-text-secondary mb-3">Neighborhood: {form.neighborhood}</p>
      )}

      <label className="block text-sm text-lt-text-secondary mb-1">Rating</label>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setForm({ ...form, rating: n })}
            className={`text-2xl ${n <= form.rating ? 'text-lt-gold' : 'text-lt-border'}`}
          >
            &#9733;
          </button>
        ))}
      </div>

      <label className="block text-sm text-lt-text-secondary mb-1">Comment</label>
      <textarea
        value={form.comment}
        onChange={e => setForm({ ...form, comment: e.target.value })}
        rows={4}
        placeholder="Share your experience..."
        className="w-full px-3 py-2 text-sm rounded-md border border-lt-border bg-white mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-lt-green/30"
      />

      <button
        type="submit"
        disabled={submitting || !form.pantry_name || !form.comment}
        className="w-full py-2 px-4 bg-lt-green text-white rounded-md text-sm font-medium hover:bg-lt-green-light disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}
