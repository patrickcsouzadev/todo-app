import { Priority } from '@prisma/client'
export const priorityStyles: Record<Priority, { badge: string; dot: string }> = {
  RED: {
    badge: 'bg-gradient-to-r from-red-500 to-red-600 border-red-400/60 text-white shadow-lg',
    dot: 'bg-red-500',
  },
  YELLOW: {
    badge: 'bg-gradient-to-r from-amber-400 to-amber-500 border-amber-300/60 text-white shadow-lg',
    dot: 'bg-amber-400',
  },
  BLUE: {
    badge: 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400/60 text-white shadow-lg',
    dot: 'bg-blue-500',
  },
}