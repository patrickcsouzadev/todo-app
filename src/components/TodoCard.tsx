'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Priority } from '@prisma/client'
import { PriorityBadge } from './PriorityBadge'
import NameLabel from './NameLabel'
import { formatRelativeTime, truncate } from '@/lib/utils'
import { handleImageLoadError } from '@/lib/handlers/imageHandlers'
import {
  handleDeleteTodo,
  handleShowDeleteConfirm,
  handleCancelDelete,
  handleToggleComplete
} from '@/lib/handlers/todoHandlers'
interface TodoCardProps {
  todo: {
    id: string
    title: string
    description?: string | null
    link?: string | null
    linkImage?: string | null
    priority: Priority
    completed: boolean
    createdAt: Date | string
    name?: {
      id: string
      label: string
    } | null
  }
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
}
export function TodoCard({ todo, onToggleComplete, onDelete }: TodoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  return (
    <div
      className={`todo-card ${todo.completed ? 'todo-card--completed' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggleComplete(todo.id, onToggleComplete)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            aria-label="Marcar como completo"
          />
          <div className="flex-1">
            <h3
              className={`todo-card__title ${todo.completed ? 'line-through' : ''}`}
            >
              {todo.title}
            </h3>
            <div className="todo-card__meta">
              <PriorityBadge priority={todo.priority} />
              <div className="ml-2">
                <NameLabel name={todo.name ?? null} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/todos/${todo.id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Editar"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
          <button
                onClick={() => handleShowDeleteConfirm(setShowDeleteConfirm)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Deletar"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      {todo.description && (
        <p className="todo-card__description">
          {truncate(todo.description, 150)}
        </p>
      )}
      {todo.link && (
        <div className="todo-card__link-preview">
          {todo.linkImage && (
            <div className="relative w-full h-48 mb-2 overflow-hidden">
              <img
                src={`/api/image-proxy?url=${encodeURIComponent(todo.linkImage)}`}
                alt="Preview do link"
                className="w-full h-full object-cover"
                onError={handleImageLoadError(todo.linkImage)}
              />
            </div>
          )}
          <a
            href={todo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="todo-card__link"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            {truncate(todo.link, 50)}
          </a>
        </div>
      )}
      <div className="todo-card__footer">
        {formatRelativeTime(todo.createdAt)}
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Tem certeza que deseja deletar esta tarefa? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleCancelDelete(setShowDeleteConfirm)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteTodo(todo.id, setIsDeleting, onDelete)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isDeleting ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}