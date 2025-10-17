'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TodoForm } from '@/components/TodoForm'
import { Priority } from '@prisma/client'
import { useNames } from '@/hooks/useNames'
export default function EditTodoPage() {
  const params = useParams()
  const id = params.id as string
  const { names, refetch } = useNames()
  const [todo, setTodo] = useState<{
    id: string
    title: string
    description?: string | null
    link?: string | null
    priority: Priority
    nameId?: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await fetch(`/api/todos/${id}`)
        const data = await response.json()
        if (data.ok) {
          setTodo(data.data)
        } else {
          setError('Tarefa não encontrada')
        }
      } catch (err) {
        setError('Erro ao carregar tarefa')
      } finally {
        setLoading(false)
      }
    }
    fetchTodo()
  }, [id])
  if (loading) {
    return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  if (error || !todo) {
    return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Tarefa não encontrada'}
          </h1>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Voltar para Dashboard
          </Link>
        </div>
      </div>
    )
  }
  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar para Dashboard
          </Link>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/80 dark:bg-gray-800/80 shadow-xl backdrop-blur-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Editar Tarefa
          </h1>
          <TodoForm
            initialData={todo}
            names={names}
            onNamesChange={refetch}
          />
        </div>
      </div>
    </div>
  )
}