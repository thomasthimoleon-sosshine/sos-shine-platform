'use client'

import { motion } from 'framer-motion'

type Props = {
  value: string
  onChange: (value: string) => void
  maxChars?: number
  suggestions?: string[]
  placeholder?: string
}

export function FreeTextInput({ value, onChange, maxChars = 200, suggestions, placeholder }: Props) {
  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Écris ici...'}
        maxLength={maxChars}
        rows={3}
        autoFocus
        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all focus:ring-2 focus:ring-[var(--brand)]"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--text-primary)',
        }}
      />
      <div className="flex justify-between">
        <span />
        <span className="text-xs" style={{ color: value.length > maxChars * 0.8 ? 'var(--brand)' : 'var(--text-muted)' }}>
          {value.length}/{maxChars}
        </span>
      </div>

      {suggestions && suggestions.length > 0 && !value && (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Besoin d&apos;inspiration ? Clique sur une suggestion :
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                onClick={() => onChange(s)}
                className="text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)',
                }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(201,169,97,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
