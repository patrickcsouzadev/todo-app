import { useState, useEffect, useMemo } from 'react'
interface Todo {
  id: string
  title: string
  description?: string | null
  link?: string | null
  linkImage?: string | null
  priority: 'RED' | 'YELLOW' | 'BLUE'
  completed: boolean
  createdAt: string
  name: {
    id: string
    label: string
  } | null
}
interface Filters {
  priority: string[]
  nameId: string
  dateFrom: string
  dateTo: string
  sort: string
}
interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
export function useTodos(filters: Filters, pagination: Pagination) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [paginationData, setPaginationData] = useState<Pagination>(pagination)
  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  )
  const progressPercentage = useMemo(() => {
    if (todos.length === 0) return 0
    return Math.round((completedCount / todos.length) * 100)
  }, [completedCount, todos.length])
  const activeFilters = useMemo(() => {
    return {
      hasFilters:
        filters.priority.length > 0 ||
        Boolean(filters.nameId) ||
        Boolean(filters.dateFrom) ||
        Boolean(filters.dateTo),
      count:
        filters.priority.length +
        (filters.nameId ? 1 : 0) +
        (filters.dateFrom ? 1 : 0) +
        (filters.dateTo ? 1 : 0),
    }
  }, [filters])
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.priority.length > 0) {
          params.append('priority', filters.priority.join(','))
        }
        if (filters.nameId) params.append('nameId', filters.nameId)
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.append('dateTo', filters.dateTo)
        params.append('sort', filters.sort)
        params.append('page', pagination.page.toString())
        params.append('limit', pagination.limit.toString())
        const response = await fetch(`/api/todos?${params}`)
        const data = await response.json()
        if (data.ok) {
          setTodos(data.data.todos)
          setPaginationData(data.data.pagination)
        }
      } catch (error) {
        console.error('Error fetching todos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTodos()
  }, [filters, pagination.page, pagination.limit])
  return {
    todos,
    setTodos,
    loading,
    completedCount,
    progressPercentage,
    activeFilters,
    pagination: paginationData,
    setPagination: setPaginationData,
  }
}