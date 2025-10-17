'use client'
import { useRouter } from 'next/navigation'
import { Priority } from '@prisma/client'
import { NameSelect } from './NameSelect'
import { LinkPreview } from './LinkPreview'
import { PriorityBadge } from './PriorityBadge'
import { useTodoForm } from '@/hooks/useTodoForm'
interface TodoFormProps {
  initialData?: {
    id: string
    title: string
    description?: string | null
    link?: string | null
    priority: Priority
    nameId?: string | null
  }
  names: Array<{ id: string; label: string }>
  onNamesChange: () => void
}
export function TodoForm({ initialData, names, onNamesChange }: TodoFormProps) {
  const router = useRouter()
  const {
    formData,
    setFormData,
    loading,
    error,
    handleSubmit,
    handleCreateName: createName,
  } = useTodoForm(initialData)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Título *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          required
          maxLength={150}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Ex: Comprar material de escritório"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Descrição
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          maxLength={2000}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Descreva os detalhes da tarefa..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prioridade *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="priority"
              value="RED"
              checked={formData.priority === 'RED'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as Priority,
                }))
              }
              className="text-red-600 focus:ring-red-500"
              aria-label="Prioridade Urgente"
            />
            <PriorityBadge priority="RED" />
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="priority"
              value="YELLOW"
              checked={formData.priority === 'YELLOW'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as Priority,
                }))
              }
              className="text-yellow-600 focus:ring-yellow-500"
              aria-label="Prioridade Importante"
            />
            <PriorityBadge priority="YELLOW" />
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="priority"
              value="BLUE"
              checked={formData.priority === 'BLUE'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as Priority,
                }))
              }
              className="text-blue-600 focus:ring-blue-500"
              aria-label="Prioridade Pode Esperar"
            />
            <PriorityBadge priority="BLUE" />
          </label>
        </div>
      </div>
      <NameSelect
        names={names}
        value={formData.nameId ?? ''}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, nameId: value }))
        }
            onCreateName={(label) => createName(label, onNamesChange)}
      />
      <div>
        <label
          htmlFor="link"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Link (opcional)
        </label>
        <input
          id="link"
          type="url"
          value={formData.link}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, link: e.target.value }))
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="https://exemplo.com"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Cole um link para ver o preview automático
        </p>
      </div>
      {formData.link && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview do Link
          </label>
          <LinkPreview url={formData.link} />
        </div>
      )}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          {loading
            ? 'Salvando...'
            : initialData
            ? 'Atualizar Tarefa'
            : 'Criar Tarefa'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition duration-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}