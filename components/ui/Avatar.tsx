import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const avatar = cva(
  [
    'rounded-full flex items-center justify-center',
    'font-medium overflow-hidden flex-shrink-0',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-8 h-8 text-sm',
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
  ({ className, size, src, name, ...props }, ref) => {
    const initials = name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '?'

    return (
      <div
        ref={ref}
        className={avatar({ size, className })}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name || ''}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] text-[var(--surface)]">
            {initials}
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar, avatar }
