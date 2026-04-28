import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badge = cva(
  'inline-flex items-center gap-1 font-medium text-[11px] tracking-wide',
  {
    variants: {
      variant: {
        default: [
          'rounded-[var(--radius-sm)]',
          'bg-[var(--surface-raised)]',
          'text-[var(--text-secondary)]',
          'px-2.5 py-1',
        ].join(' '),
        success: [
          'rounded-[var(--radius-sm)]',
          'bg-[var(--success-alpha-weak)]',
          'text-[var(--success)]',
          'px-2.5 py-1',
        ].join(' '),
        danger: [
          'rounded-[var(--radius-sm)]',
          'bg-[var(--danger-alpha-weak)]',
          'text-[var(--danger)]',
          'px-2.5 py-1',
        ].join(' '),
        warning: [
          'rounded-[var(--radius-sm)]',
          'bg-[rgba(212,160,84,0.08)]',
          'text-[var(--warning)]',
          'px-2.5 py-1',
        ].join(' '),
        brand: [
          'rounded-[var(--radius-sm)]',
          'bg-[var(--brand-alpha-weak)]',
          'text-[var(--brand)]',
          'px-2.5 py-1',
        ].join(' '),
        outline: [
          'rounded-full',
          'bg-transparent',
          'border border-[var(--border)]',
          'text-[var(--text-muted)]',
          'px-3 py-1',
        ].join(' '),
        pill: [
          'rounded-full',
          'bg-[var(--brand-alpha-weak)]',
          'text-[var(--brand)]',
          'px-3 py-1',
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
