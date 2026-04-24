import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badge = cva(
  'inline-flex items-center gap-1 font-medium text-sm px-2.5 py-0.5',
  {
    variants: {
      variant: {
        default: [
          'rounded-[var(--radius-md)]',
          'bg-[rgba(255,255,255,0.05)]',
          'text-[var(--text-secondary)]',
        ].join(' '),
        success: [
          'rounded-[var(--radius-md)]',
          'bg-[var(--success-alpha-weak)]',
          'text-[var(--success)]',
        ].join(' '),
        danger: [
          'rounded-[var(--radius-md)]',
          'bg-[var(--danger-alpha-weak)]',
          'text-[var(--danger)]',
        ].join(' '),
        brand: [
          'rounded-[var(--radius-md)]',
          'bg-[var(--brand-alpha-weak)]',
          'text-[var(--brand)]',
        ].join(' '),
        outline: [
          'rounded-full',
          'bg-transparent',
          'border border-[var(--border)]',
          'text-[var(--text-muted)]',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={badge({ variant, className })}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badge }
