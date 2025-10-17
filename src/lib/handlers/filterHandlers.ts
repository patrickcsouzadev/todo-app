import { Priority } from '@prisma/client'
export interface FilterState {
  priority: string[]
  nameId: string
  dateFrom: string
  dateTo: string
  sort: string
}
export const togglePriority = (
  priority: Priority,
  currentFilters: FilterState,
  onFilterChange: (filters: FilterState) => void
) => {
  const newPriorities = currentFilters.priority.includes(priority)
    ? currentFilters.priority.filter((p) => p !== priority)
    : [...currentFilters.priority, priority]
  onFilterChange({ ...currentFilters, priority: newPriorities })
}
export const clearFilters = (onFilterChange: (filters: FilterState) => void) => {
  onFilterChange({
    priority: [],
    nameId: '',
    dateFrom: '',
    dateTo: '',
    sort: 'createdAt_desc',
  })
}
export const hasActiveFilters = (filters: FilterState): boolean => {
  return (
    filters.priority.length > 0 ||
    !!filters.nameId ||
    !!filters.dateFrom ||
    !!filters.dateTo
  )
}
export const getCurrentSortLabel = (sort: string): string => {
  switch (sort) {
    case 'createdAt_desc':
      return 'Mais recentes'
    case 'createdAt_asc':
      return 'Mais antigas'
    case 'priority_desc':
      return 'Prioridade alta'
    case 'priority_asc':
      return 'Prioridade baixa'
    case 'title_asc':
      return 'A-Z'
    case 'title_desc':
      return 'Z-A'
    default:
      return 'Mais recentes'
  }
}



