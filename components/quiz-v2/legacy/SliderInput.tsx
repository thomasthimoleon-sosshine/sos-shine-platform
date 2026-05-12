'use client'

import { useEffect, useRef } from 'react'

type Props = {
  value: number
  onChange: (value: number) => void
  onMount?: () => void
  onAutoAdvance?: () => void
  labels: { left: string; right: string }
  hasOther?: boolean
  otherText: string
  onOtherChange: (text: string) => void
}

export function SliderInput({ value, onChange, onMount, onAutoAdvance, labels, hasOther, otherText, onOtherChange }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    onMount?.()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (v: number) => {
    onChange(v)
    if (onAutoAdvance) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onAutoAdvance, 500)
    }
  }

  return (
    <div className="space-y-8">
      <div className="px-2">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          className="w-full appearance-none cursor-pointer"
          style={{
            height: '6px',
            borderRadius: '9999px',
            background: `linear-gradient(to right, var(--brand) 0%, var(--brand) ${((value - 1) / 9) * 100}%, rgba(255,255,255,0.08) ${((value - 1) / 9) * 100}%, rgba(255,255,255,0.08) 100%)`,
          }}
        />
        <div className="flex justify-between items-center mt-4">
          <p className="text-xs max-w-[42%] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{labels.left}</p>
          <span className="text-3xl font-bold" style={{ color: 'var(--brand)' }}>{value}</span>
          <p className="text-xs max-w-[42%] text-right leading-relaxed" style={{ color: 'var(--text-muted)' }}>{labels.right}</p>
        </div>
      </div>

      {hasOther && (
        <div>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Je veux préciser :</p>
          <textarea
            value={otherText}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Optionnel..."
            maxLength={200}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
          />
        </div>
      )}
    </div>
  )
}
