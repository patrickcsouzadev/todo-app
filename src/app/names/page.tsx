'use client'
import Link from 'next/link'
import { useNamesManager } from '@/hooks/useNamesManager'
export default function NamesPage() {
  const {
    names,
    loading,
    newNameLabel,
    setNewNameLabel,
    editingId,
    setEditingId,
    editingLabel,
    setEditingLabel,
    isCreating,
    createName,
    updateName,
    deleteName,
  } = useNamesManager()
  return (
    <div className="page-content-wrapper max-w-4xl mx-auto px-4 py-8">
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
          Gerenciar Pessoas
        </h1>
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Adicionar Nova Pessoa
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newNameLabel}
              onChange={(e) => setNewNameLabel(e.target.value)}
              placeholder="Nome da pessoa"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createName()
                }
              }}
            />
            <button
              onClick={createName}
              disabled={isCreating || !newNameLabel.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isCreating ? 'Criando...' : 'Adicionar'}
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : names.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-300">
            Nenhuma pessoa cadastrada ainda
          </div>
        ) : (
          <div className="space-y-3">
            {names.map((name) => (
              <div
                key={name.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {editingId === name.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-white text-gray-900"
                      autoFocus
                      aria-label="Editar nome"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateName(name.id)
                        } else if (e.key === 'Escape') {
                          setEditingId(null)
                          setEditingLabel('')
                        }
                      }}
                    />
                    <button
                      onClick={() => updateName(name.id)}
                      className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditingLabel('')
                      }}
                      className="px-4 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      {name.label}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(name.id)
                          setEditingLabel(name.label)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
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
                      </button>
                      <button
                        onClick={() => deleteName(name.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}