import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
export function getPriorityColor(priority: 'RED' | 'YELLOW' | 'BLUE'): string {
  const colors = {
    RED: 'bg-red-500',
    YELLOW: 'bg-yellow-500',
    BLUE: 'bg-blue-500',
  }
  return colors[priority]
}
export function getPriorityLabel(priority: 'RED' | 'YELLOW' | 'BLUE'): string {
  const labels = {
    RED: 'Urgente',
    YELLOW: 'Importante',
    BLUE: 'Pode Esperar',
  }
  return labels[priority]
}



