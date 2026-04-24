import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const card = cva('rounded-xl transition-all duration-[var(--transition-base)]', {
  variants: {
    variant: {
      elevated: [
        'bg-[var(--surface-card)]',
        'border border-[var(--border)]',
        'shadow-[var(--shadow-sm)]',
      ].join(' '),
      flat: [
        'bg-[rgba(255,255,255,0.03)]',
        'border border-[rgba(255,255,255,0.06)]',
      ].join(' '),
    },
  },
  defaultVariants: {
    variant: 'elevated',
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={card({ variant, className })}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

const paddingMap = { sm: 'px-4 py-3', md: 'px-6 py-4', lg: 'px-8 py-6' } as const

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => (
  <div
    ref={ref}
    className={`${paddingMap[size]} border-b border-[var(--border)] ${className || ''}`}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => {
  const contentPadding = { sm: 'p-4', md: 'p-6', lg: 'p-8' } as const
  return (
    <div
      ref={ref}
      className={`${contentPadding[size]} ${className || ''}`}
      {...props}
    />
  )
})
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardContent }
