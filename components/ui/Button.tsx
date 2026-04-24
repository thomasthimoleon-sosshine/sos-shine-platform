'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const button = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium font-[family-name:var(--font-body)]',
    'transition-all duration-[var(--transition-base)]',
    'cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2',
    'focus-visible:ring-offset-[var(--surface)]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)]',
          'text-[var(--surface)]',
          'shadow-[var(--shadow-brand)]',
          'rounded-full',
          'hover:brightness-110 active:scale-[0.98]',
        ].join(' '),
        secondary: [
          'bg-[var(--brand-alpha-weak)]',
          'border border-[var(--brand-alpha-medium)]',
          'text-[var(--brand)]',
          'rounded-full',
          'hover:bg-[var(--brand-alpha-medium)] active:scale-[0.98]',
        ].join(' '),
        ghost: [
          'text-[var(--text-secondary)]',
          'border border-white/[0.06]',
          'hover:bg-white/5 hover:border-white/[0.12]',
          'rounded-lg',
          'active:scale-[0.98]',
        ].join(' '),
        destructive: [
          'bg-[var(--danger-alpha-weak)]',
          'border border-[var(--danger-alpha-medium)]',
          'text-[var(--danger)]',
          'rounded-full',
          'hover:bg-[var(--danger-alpha-medium)] active:scale-[0.98]',
        ].join(' '),
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
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
            <Loader2 className="w-4 h-4 animate-spin" />
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
