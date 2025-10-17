import { Priority } from '@prisma/client'
import { cn, getPriorityColor, getPriorityLabel } from '@/lib/utils'
interface PriorityBadgeProps {
  priority: Priority
  className?: string
}
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colorClass = getPriorityColor(priority)
  const label = getPriorityLabel(priority)
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}



