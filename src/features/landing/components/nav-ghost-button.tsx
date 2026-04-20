import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '#/shared/lib/utils'

type NavGhostButtonProps = ComponentPropsWithoutRef<'button'> & {
  borderColor: string
  children: ReactNode
  foreground: string
  hoverBackground: string
}

export default function NavGhostButton({
  borderColor,
  children,
  className,
  foreground,
  hoverBackground,
  type = 'button',
  ...props
}: NavGhostButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        'inline-flex h-[2.1875rem] cursor-pointer items-center justify-center gap-2 px-[0.875rem] text-[0.75rem] font-medium transition-colors sm:px-[1.125rem] sm:text-[0.8125rem]',
        className,
      )}
      style={{
        background: 'none',
        border: `0.0625rem solid ${borderColor}`,
        color: foreground,
        fontFamily: 'inherit',
      }}
      onMouseEnter={(event) => {
        props.onMouseEnter?.(event)
        event.currentTarget.style.background = hoverBackground
      }}
      onMouseLeave={(event) => {
        props.onMouseLeave?.(event)
        event.currentTarget.style.background = 'none'
      }}
    >
      {children}
    </button>
  )
}
