'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const input = cva(
  [
    'w-full px-4 py-3 rounded-[var(--radius-lg)] text-sm',
    'font-[family-name:var(--font-body)]',
    'outline-none',
    'transition-all duration-[var(--transition-base)]',
    'placeholder:text-[var(--text-muted)]',
    'focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-[var(--surface)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      state: {
        default: [
          'bg-[rgba(255,255,255,0.04)]',
          'border border-[var(--border)]',
          'text-[var(--text-primary)]',
          'focus-visible:ring-[var(--brand)]',
          'focus-visible:border-[var(--brand)]',
        ].join(' '),
        error: [
          'bg-[var(--danger-alpha-weak)]',
          'border border-[var(--danger-alpha-medium)]',
          'text-[var(--text-primary)]',
          'focus-visible:ring-[var(--danger)]',
        ].join(' '),
        success: [
          'bg-[var(--success-alpha-weak)]',
          'border border-[var(--success-alpha-medium)]',
          'text-[var(--text-primary)]',
          'focus-visible:ring-[var(--success)]',
        ].join(' '),
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof input> {
  label?: string
  hint?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, state, label, hint, error, id, ...props }, ref) => {
    const resolvedState = error ? 'error' : (state || 'default')
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={input({ state: resolvedState as 'default' | 'error' | 'success', className })}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-[var(--text-muted)]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input, input }
