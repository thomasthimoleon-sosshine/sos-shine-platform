'use client'

import { useEffect } from 'react'

type Props = {
  value: number
  onChange: (value: number) => void
  onMount?: () => void
  labels: { left: string; right: string }
  hasOther?: boolean
  otherText: string
  onOtherChange: (text: string) => void
}

export function SliderInput({ value, onChange, onMount, labels, hasOther, otherText, onOtherChange }: Props) {
  useEffect(() => { onMount?.() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="px-2">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--gold) 0%, var(--gold) ${((value - 1) / 9) * 100}%, rgba(255,255,255,0.08) ${((value - 1) / 9) * 100}%, rgba(255,255,255,0.08) 100%)`,
          }}
        />
        <div className="flex justify-between mt-3">
          <p className="text-xs max-w-[45%]" style={{ color: 'var(--text-muted)' }}>{labels.left}</p>
          <span className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{value}</span>
          <p className="text-xs max-w-[45%] text-right" style={{ color: 'var(--text-muted)' }}>{labels.right}</p>
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
