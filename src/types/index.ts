import { Priority } from '@prisma/client'
export interface User {
  id: string
  email: string
  isConfirmed: boolean
  createdAt: Date
}
export interface Name {
  id: string
  label: string
  userId: string
  createdAt: Date
}
export interface Todo {
  id: string
  title: string
  description?: string | null
  link?: string | null
  linkImage?: string | null
  priority: Priority
  nameId: string
  name: Name
  userId: string
  createdAt: Date
  updatedAt: Date
  completed: boolean
}
export interface TodoFilters {
  priority?: string
  nameId?: string
  dateFrom?: string
  dateTo?: string
  sort?: 'createdAt_asc' | 'createdAt_desc' | 'priority'
  page?: number
  limit?: number
}
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  message?: string
}



