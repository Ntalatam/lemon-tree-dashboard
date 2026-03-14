export default function LoadingSpinner({ message = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-lt-green/20 border-t-lt-green rounded-full animate-spin" />
      <p className="mt-3 text-sm text-lt-text-secondary">{message}</p>
    </div>
  )
}
