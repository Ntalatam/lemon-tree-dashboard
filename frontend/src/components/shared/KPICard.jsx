import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

function useAnimatedValue(target) {
  const [display, setDisplay] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = target

    // Only animate numeric values
    const numTarget = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.-]/g, ''))
    const numPrev = typeof prev === 'number' ? prev : parseFloat(String(prev).replace(/[^0-9.-]/g, ''))

    if (isNaN(numTarget) || isNaN(numPrev) || numTarget === numPrev) {
      setDisplay(target)
      return
    }

    const duration = 600
    const startTime = performance.now()
    let frame

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = numPrev + (numTarget - numPrev) * eased

      // Preserve the original format (e.g. "1,234" or "15.8%")
      if (typeof target === 'string') {
        const suffix = target.replace(/[0-9,.-]/g, '')
        const isFloat = target.includes('.')
        const formatted = isFloat
          ? current.toFixed(1)
          : Math.round(current).toLocaleString()
        setDisplay(formatted + suffix)
      } else {
        setDisplay(Math.round(current))
      }

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      } else {
        setDisplay(target)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return display
}

export default function KPICard({ icon: Icon, label, value, sublabel, color = 'green' }) {
  const colorMap = {
    green: 'text-lt-green',
    amber: 'text-lt-amber',
    blue: 'text-lt-blue',
    gold: 'text-lt-gold',
  }

  const animated = useAnimatedValue(value)

  return (
    <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50 hover:border-lt-green/30 transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        {Icon && <Icon size={20} className={clsx(colorMap[color] || colorMap.green)} />}
        <span className="text-sm text-lt-text-secondary">{label}</span>
      </div>
      <p className={clsx('text-2xl font-mono font-medium tabular-nums', colorMap[color] || colorMap.green)}>{animated}</p>
      {sublabel && <p className="text-xs text-lt-text-secondary mt-1">{sublabel}</p>}
    </div>
  )
}
