import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const card = cva('rounded-xl transition-all', {
  variants: {
    variant: {
      elevated: '',
      flat: '',
    },
  },
  defaultVariants: {
    variant: 'elevated',
  },
})

const variantStyles: Record<string, React.CSSProperties> = {
  elevated: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  flat: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
}

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, style, children, ...props }, ref) => {
    const v = variant || 'elevated'
    return (
      <div
        ref={ref}
        className={card({ variant, className })}
        style={{ ...variantStyles[v], ...style }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`px-5 py-4 ${className || ''}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`p-5 ${className || ''}`} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardContent }
