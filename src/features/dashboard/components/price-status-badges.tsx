import { IconAlertTriangle } from '@tabler/icons-react'
import { Badge } from '#/shared/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/shared/ui/tooltip'

function formatLastUpdatedAt(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp)
}

export function StaleBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="border-warning/20 bg-warning/10 text-warning"
        >
          <IconAlertTriangle className="size-3" />
          Stale
        </Badge>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        Price may be up to 15 min old.
      </TooltipContent>
    </Tooltip>
  )
}

export function LiveBadge({ lastUpdatedAt }: { lastUpdatedAt: number | null }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          Live
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {lastUpdatedAt === null
          ? 'Last update time unavailable.'
          : `Last updated at ${formatLastUpdatedAt(lastUpdatedAt)}.`}
      </TooltipContent>
    </Tooltip>
  )
}
