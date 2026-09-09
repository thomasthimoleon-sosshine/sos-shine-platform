import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const card = cva(
  [
    'rounded-[var(--radius-xl)]',
    'transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
  ].join(' '),
  {
    variants: {
      variant: {
        elevated: [
          'bg-[var(--surface-card)]',
          'border border-[var(--border)]',
          'shadow-[var(--shadow-sm)]',
        ].join(' '),
        raised: [
          'bg-[var(--surface-raised)]',
          'border border-[var(--border-subtle)]',
        ].join(' '),
        ghost: [
          'bg-transparent',
          'border border-[var(--border-subtle)]',
        ].join(' '),
        glow: [
          'bg-[var(--surface-card)]',
          'border border-[var(--border)]',
          'shadow-[var(--shadow-sm)]',
          'hover:border-[var(--border-medium)]',
          'hover:shadow-[var(--glow-gold)]',
        ].join(' '),
        interactive: [
          'bg-[var(--surface-card)]',
          'border border-[var(--border)]',
          'shadow-[var(--shadow-xs)]',
          'hover:bg-[var(--surface-elevated)]',
          'hover:border-[var(--border-medium)]',
          'hover:shadow-[var(--shadow-md)]',
          'cursor-pointer',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'elevated',
    },
  }
)

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

const paddingMap = {
  sm: 'px-4 py-3',
  md: 'px-6 py-4',
  lg: 'px-8 py-6',
} as const

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => (
  <div
    ref={ref}
    className={`${paddingMap[size]} border-b border-[var(--border-subtle)] ${className || ''}`}
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

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => (
  <div
    ref={ref}
    className={`${paddingMap[size]} border-t border-[var(--border-subtle)] ${className || ''}`}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }
