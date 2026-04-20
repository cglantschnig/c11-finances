import type { ComponentPropsWithoutRef } from 'react'
import { IconArrowRight } from '@tabler/icons-react'

type TealCtaButtonProps = ComponentPropsWithoutRef<'button'> & {
  background: string
}

export default function TealCtaButton({
  background,
  type = 'button',
  ...props
}: TealCtaButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 text-[0.9375rem] font-semibold text-white transition-opacity hover:opacity-85 active:scale-[0.98] sm:w-auto"
      style={{
        background,
        border: 'none',
        fontFamily: 'inherit',
        padding: '0.875rem 2rem',
      }}
    >
      Sign in to begin
      <IconArrowRight className="size-4" strokeWidth={2.2} />
    </button>
  )
}
