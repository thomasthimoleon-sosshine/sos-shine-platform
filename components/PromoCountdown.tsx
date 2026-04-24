'use client'

import { useState, useEffect } from 'react'

/**
 * Returns the end of the current month (last day, 23:59:59) in UTC.
 * When the countdown reaches zero, it auto-resets to the end of the NEXT month.
 */
function getEndOfMonth(): Date {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return end
}

function getTimeLeft(target: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function PromoCountdown({ className }: { className?: string }) {
  const [target, setTarget] = useState(getEndOfMonth)
  const [time, setTime] = useState(getTimeLeft(target))

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      let t = target
      if (now >= t) {
        t = getEndOfMonth()
        setTarget(t)
      }
      setTime(getTimeLeft(t))
    }, 1000)
    return () => clearInterval(interval)
  }, [target])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={`flex items-center gap-1.5 text-sm font-mono ${className || ''}`}>
      <span className="px-1.5 py-0.5 rounded bg-[var(--brand-alpha-weak)] text-[var(--brand)]">{pad(time.days)}j</span>
      <span className="text-[var(--text-muted)]">:</span>
      <span className="px-1.5 py-0.5 rounded bg-[var(--brand-alpha-weak)] text-[var(--brand)]">{pad(time.hours)}h</span>
      <span className="text-[var(--text-muted)]">:</span>
      <span className="px-1.5 py-0.5 rounded bg-[var(--brand-alpha-weak)] text-[var(--brand)]">{pad(time.minutes)}m</span>
      <span className="text-[var(--text-muted)]">:</span>
      <span className="px-1.5 py-0.5 rounded bg-[var(--brand-alpha-weak)] text-[var(--brand)]">{pad(time.seconds)}s</span>
    </div>
  )
}

export const PROMO = {
  code: 'SHINE2026',
  originalPrice: '49,90',
  promoPrice: '29,90',
  currency: '€',
} as const
