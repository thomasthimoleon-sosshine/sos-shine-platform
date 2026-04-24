import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const input = cva(
  'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-[var(--text-muted)]',
  {
    variants: {
      state: {
        default: '',
        error: '',
        success: '',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
)

const stateStyles: Record<string, React.CSSProperties> = {
  default: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-primary)',
  },
  error: {
    background: 'rgba(232, 93, 93, 0.04)',
    border: '1px solid rgba(232, 93, 93, 0.3)',
    color: 'var(--text-primary)',
  },
  success: {
    background: 'rgba(85, 239, 196, 0.04)',
    border: '1px solid rgba(85, 239, 196, 0.3)',
    color: 'var(--text-primary)',
  },
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof input> {
  label?: string
  hint?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, state, label, hint, error, style, ...props }, ref) => {
    const s = error ? 'error' : (state || 'default')
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={input({ state: s as 'default' | 'error' | 'success', className })}
          style={{ ...stateStyles[s], ...style }}
          {...props}
        />
        {error && (
          <p className="text-xs" style={{ color: '#E85D5D' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
