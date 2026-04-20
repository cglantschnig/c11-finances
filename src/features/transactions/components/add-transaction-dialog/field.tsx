import type { ReactNode } from 'react'

export default function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}
