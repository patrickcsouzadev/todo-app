'use client'
import { useState } from 'react'
interface NameSelectProps {
  names: Array<{ id: string; label: string }>
  value?: string | null
  onChange: (value: string) => void
  onCreateName: (label: string) => Promise<void>
}
export function NameSelect({
  names,
  value,
  onChange,
  onCreateName,
}: NameSelectProps) {
  const [showNewNameInput, setShowNewNameInput] = useState(false)
  const [newNameLabel, setNewNameLabel] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const handleCreateName = async () => {
    if (!newNameLabel.trim()) return
    setIsCreating(true)
    try {
      await onCreateName(newNameLabel.trim())
      setNewNameLabel('')
      setShowNewNameInput(false)
    } catch (error) {
      console.error('Error creating name:', error)
    } finally {
      setIsCreating(false)
    }
  }
  return (
    <div>
      <label
        htmlFor="nameSelect"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Pessoa *
      </label>
      {!showNewNameInput ? (
        <div className="flex gap-2">
          <select
            id="nameSelect"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            required
            className="flex-1 px-4 py-2 border border-white/30 bg-white/10 backdrop-blur rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          >
            <option value="">Selecione uma pessoa</option>
            {names.map((name) => (
              <option key={name.id} value={name.id}>
                {name.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewNameInput(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors whitespace-nowrap"
            title="Adicionar nova pessoa"
          >
            + Novo
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newNameLabel}
              onChange={(e) => setNewNameLabel(e.target.value)}
              placeholder="Nome da pessoa"
              className="flex-1 px-4 py-2 border border-white/30 bg-white/10 backdrop-blur rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateName()
                } else if (e.key === 'Escape') {
                  setShowNewNameInput(false)
                  setNewNameLabel('')
                }
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={handleCreateName}
              disabled={isCreating || !newNameLabel.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
            >
              {isCreating ? 'Criando...' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewNameInput(false)
                setNewNameLabel('')
              }}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pressione Enter para criar ou Esc para cancelar
          </p>
        </div>
      )}
    </div>
  )
}