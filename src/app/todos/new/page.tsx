'use client'
import Link from 'next/link'
import { TodoForm } from '@/components/TodoForm'
import { useNames } from '@/hooks/useNames'
export default function NewTodoPage() {
  const { names, refetch } = useNames()
  return (
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
      <div className="rounded-2xl border border-white/15 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Nova Tarefa
        </h1>
        <TodoForm names={names} onNamesChange={refetch} />
      </div>
    </div>
  )
}