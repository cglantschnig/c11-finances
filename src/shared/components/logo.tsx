import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '#/shared/lib/utils'

type LogoProps = Omit<ComponentPropsWithoutRef<'img'>, 'src'> & {
  framed?: boolean
}

export default function Logo({
  alt = 'c11 Finances logo',
  className,
  framed = false,
  ...props
}: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={346}
      height={346}
      className={cn(
        'h-auto shrink-0 object-contain',
        framed &&
          'rounded-xl border border-border/70 bg-background/80 p-1.5 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
