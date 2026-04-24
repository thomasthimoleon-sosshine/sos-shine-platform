import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const button = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]',
  {
    variants: {
      variant: {
        primary:
          'text-[#050505] rounded-full',
        secondary:
          'rounded-full',
        ghost:
          'rounded-lg bg-transparent hover:bg-[rgba(255,255,255,0.05)]',
        destructive:
          'rounded-full',
      },
      size: {
        sm: 'px-4 py-2 text-xs',
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

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--gold), var(--gold-deep, #B8960F))',
    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
  },
  secondary: {
    background: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    color: 'var(--gold)',
  },
  ghost: {
    color: 'var(--text-secondary)',
  },
  destructive: {
    background: 'rgba(232, 93, 93, 0.08)',
    border: '1px solid rgba(232, 93, 93, 0.2)',
    color: '#E85D5D',
  },
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, style, ...props }, ref) => {
    const v = variant || 'primary'
    return (
      <button
        ref={ref}
        className={button({ variant, size, className })}
        style={{ ...variantStyles[v], ...style }}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, button }
