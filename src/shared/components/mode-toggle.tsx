"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { Button } from "#/shared/ui/button"
import { cn } from "#/shared/lib/utils"

type ModeToggleRenderProps = {
  icon: React.ReactNode
  isDark: boolean
  label: string
  nextTheme: "dark" | "light"
}

export default function ModeToggle({
  children,
  className,
  showLabel = false,
  size,
  variant,
}: {
  children?: (props: ModeToggleRenderProps) => React.ReactNode
  className?: string
  showLabel?: boolean
  size?: React.ComponentProps<typeof Button>["size"]
  variant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const nextTheme = isDark ? "light" : "dark"
  const label = isDark ? "Dark" : "Light"
  const icon = isDark ? (
    <IconMoon className="size-4" />
  ) : (
    <IconSun className="size-4" />
  )
  const content = children
    ? children({ icon, isDark, label, nextTheme })
    : (
      <>
        {icon}
        {showLabel ? <span>{label}</span> : null}
      </>
    )

  return (
    <Button
      type="button"
      variant={variant ?? "outline"}
      size={size ?? (showLabel ? "sm" : "icon-sm")}
      className={cn("shrink-0", className)}
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={() => setTheme(nextTheme)}
    >
      {content}
    </Button>
  )
}
