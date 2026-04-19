"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"
import { Button } from "#/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import { cn } from "#/lib/utils"

export default function ModeToggle({
  className,
}: {
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const icon = !mounted ? (
    <IconDeviceDesktop className="size-4" />
  ) : resolvedTheme === "dark" ? (
    <IconMoon className="size-4" />
  ) : (
    <IconSun className="size-4" />
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className={cn("shrink-0", className)}
          aria-label="Toggle theme"
        >
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <IconSun className="size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <IconMoon className="size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <IconDeviceDesktop className="size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
