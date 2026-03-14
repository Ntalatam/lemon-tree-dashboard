export default function FilterBar({ filters, values, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {filters.map(({ key, label, options }) => (
        <div key={key} className="flex flex-col">
          <label className="text-xs text-lt-text-secondary mb-1">{label}</label>
          <select
            value={values[key] || ''}
            onChange={e => onChange(key, e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-lt-border bg-white text-lt-text focus:outline-none focus:ring-2 focus:ring-lt-green/30"
          >
            <option value="">All</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
