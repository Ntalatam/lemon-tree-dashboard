export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-serif text-lt-text">{title}</h1>
      {subtitle && <p className="mt-1 text-lt-text-secondary">{subtitle}</p>}
    </div>
  )
}
