'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const input = cva(
  [
    'w-full px-4 py-3 text-sm',
    'rounded-[var(--radius-lg)]',
    'outline-none',
    'transition-all duration-[220ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]',
    'placeholder:text-[var(--text-muted)]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      state: {
        default: [
          'bg-[var(--surface-raised)]',
          'border border-[var(--border-subtle)]',
          'text-[var(--text-primary)]',
          'focus:border-[var(--brand-alpha-strong)]',
          'focus:bg-[var(--surface-card)]',
          'focus:shadow-[0_0_0_3px_var(--brand-alpha-weak)]',
        ].join(' '),
        error: [
          'bg-[var(--danger-alpha-weak)]',
          'border border-[var(--danger-alpha-medium)]',
          'text-[var(--text-primary)]',
          'focus:shadow-[0_0_0_3px_var(--danger-alpha-weak)]',
        ].join(' '),
        success: [
          'bg-[var(--success-alpha-weak)]',
          'border border-[var(--success-alpha-medium)]',
          'text-[var(--text-primary)]',
          'focus:shadow-[0_0_0_3px_var(--success-alpha-weak)]',
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
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-[var(--text-secondary)] tracking-wide"
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
          <p id={`${inputId}-error`} className="text-[13px] text-[var(--danger)] mt-1" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-[13px] text-[var(--text-muted)] mt-1">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input, input }
