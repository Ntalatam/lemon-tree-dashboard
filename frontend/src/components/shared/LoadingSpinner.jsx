export default function LoadingSpinner({ message = 'Loading data...', variant = 'spinner' }) {
  if (variant === 'skeleton') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
              <div className="h-4 w-24 bg-lt-border/40 rounded mb-3" />
              <div className="h-8 w-20 bg-lt-border/60 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50 h-[460px]">
            <div className="h-5 w-48 bg-lt-border/40 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 bg-lt-border/30 rounded" style={{ width: `${70 - i * 5}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50 h-[460px]">
            <div className="h-5 w-40 bg-lt-border/40 rounded mb-4" />
            <div className="h-[380px] bg-lt-border/20 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-lt-green/20 border-t-lt-green rounded-full animate-spin" />
      <p className="mt-3 text-sm text-lt-text-secondary">{message}</p>
    </div>
  )
}
