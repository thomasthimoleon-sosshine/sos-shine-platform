import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badge = cva('inline-flex items-center gap-1 font-medium', {
  variants: {
    variant: {
      default: 'text-[10px] px-2 py-0.5 rounded-lg',
      success: 'text-[10px] px-2 py-0.5 rounded-lg',
      danger: 'text-[10px] px-2 py-0.5 rounded-lg',
      gold: 'text-[10px] px-2 py-0.5 rounded-lg',
      outline: 'text-[10px] px-2.5 py-1 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
  },
  success: {
    background: 'rgba(85, 239, 196, 0.08)',
    color: '#55EFC4',
  },
  danger: {
    background: 'rgba(232, 93, 93, 0.08)',
    color: '#E85D5D',
  },
  gold: {
    background: 'rgba(212, 175, 55, 0.08)',
    color: 'var(--gold)',
  },
  outline: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'var(--text-muted)',
  },
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, style, ...props }, ref) => {
    const v = variant || 'default'
    return (
      <span
        ref={ref}
        className={badge({ variant, className })}
        style={{ ...variantStyles[v], ...style }}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }
