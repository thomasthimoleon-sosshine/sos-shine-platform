'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const button = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium tracking-wide',
    'transition-all duration-[220ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]',
    'cursor-pointer select-none',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2',
    'focus-visible:ring-offset-[var(--surface)]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--brand)] text-[var(--text-inverse)]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.2),0_0_0_1px_rgba(184,164,114,0.15)]',
          'rounded-[var(--radius-lg)]',
          'hover:bg-[var(--brand-light)] hover:shadow-[0_2px_8px_rgba(184,164,114,0.15)]',
          'active:scale-[0.98] active:bg-[var(--brand-deep)]',
        ].join(' '),
        secondary: [
          'bg-[var(--surface-raised)] text-[var(--text-primary)]',
          'border border-[var(--border-medium)]',
          'rounded-[var(--radius-lg)]',
          'hover:bg-[var(--surface-card)] hover:border-[var(--border-strong)]',
          'active:scale-[0.98]',
        ].join(' '),
        ghost: [
          'text-[var(--text-secondary)]',
          'rounded-[var(--radius-md)]',
          'hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]',
          'active:scale-[0.98]',
        ].join(' '),
        destructive: [
          'bg-[var(--danger-alpha-weak)] text-[var(--danger)]',
          'border border-[var(--danger-alpha-medium)]',
          'rounded-[var(--radius-lg)]',
          'hover:bg-[var(--danger-alpha-medium)]',
          'active:scale-[0.98]',
        ].join(' '),
        brand: [
          'bg-transparent text-[var(--brand)]',
          'border border-[var(--brand-alpha-medium)]',
          'rounded-[var(--radius-lg)]',
          'hover:bg-[var(--brand-alpha-weak)] hover:border-[var(--brand-alpha-strong)]',
          'active:scale-[0.98]',
        ].join(' '),
        cta: [
          'bg-[var(--brand)] text-[var(--text-inverse)]',
          'rounded-full font-semibold',
          'shadow-[0_0_24px_rgba(184,164,114,0.08),0_1px_2px_rgba(0,0,0,0.2)]',
          'hover:shadow-[0_0_40px_rgba(184,164,114,0.12),0_2px_8px_rgba(0,0,0,0.2)]',
          'hover:bg-[var(--brand-light)]',
          'active:scale-[0.98] active:bg-[var(--brand-deep)]',
          'transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        ].join(' '),
      },
      size: {
        xs: 'px-3 py-1.5 text-xs',
        sm: 'px-4 py-2 text-[13px]',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-[15px]',
        xl: 'px-9 py-4 text-base',
        icon: 'p-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={button({ variant, size, className })}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin opacity-70" />
            <span className="sr-only">Chargement</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, button }
