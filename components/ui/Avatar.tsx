import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const avatar = cva(
  'rounded-full flex items-center justify-center font-medium overflow-hidden flex-shrink-0',
  {
    variants: {
      size: {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-base',
        xl: 'w-20 h-20 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatar> {
  src?: string | null
  name?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, name, style, ...props }, ref) => {
    const initials = name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '?'

    return (
      <div
        ref={ref}
        className={avatar({ size, className })}
        style={{
          background: src ? 'transparent' : 'linear-gradient(135deg, var(--gold), var(--gold-deep, #B8960F))',
          color: '#050505',
          ...style,
        }}
        {...props}
      >
        {src ? (
          <img src={src} alt={name || ''} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar }
