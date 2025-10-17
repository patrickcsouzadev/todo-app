'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TodoCard } from '@/components/TodoCard'
import { FiltersBar } from '@/components/FiltersBar'
import { useTodos } from '@/hooks/useTodos'
import { useNames } from '@/hooks/useNames'
import { handleLogout } from '@/lib/handlers/authHandlers'
import { mapProgressToClass } from '@/lib/uiUtils'
export default function DashboardPage() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    priority: [] as string[],
    nameId: '',
    dateFrom: '',
    dateTo: '',
    sort: 'createdAt_desc',
  })
  const [paginationState, setPaginationState] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const { names } = useNames()
  const {
    todos,
    setTodos,
    loading,
    completedCount,
    progressPercentage,
    activeFilters,
    pagination,
    setPagination,
  } = useTodos(filters, paginationState)
  const onToggleComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    )
  }
  const onDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }
  const onLogout = () => {
    router.push('/auth/login')
  }
  return (
    <div className="space-y-10 pb-10">
      <section className="glass-panel overflow-hidden px-8 py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-600/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-red-500 border border-red-500/30">
              Painel inteligente
            </span>
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              Organize sua rotina com fluidez e acompanhe as tarefas em tempo
              real.
            </h1>
            <p className="text-base text-gray-300">
              Visualize prioridades, pessoas responsáveis e histórico de forma
              dinâmica. Ajuste filtros, acompanhe progresso e mantenha sua
              equipe em sincronia.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/todos/new"
                className="btn btn-primary"
              >
                <span className="btn-icon">+</span>
                Nova tarefa
              </Link>
              <Link
                href="/names"
                className="btn btn-outline"
              >
                Gerenciar pessoas
              </Link>
              <button
                onClick={() => handleLogout(router)}
                className="btn btn-ghost"
              >
                Sair
              </button>
            </div>
          </div>
          <div className="grid w-full max-w-md grid-cols-2 gap-4 rounded-2xl border border-white/15 bg-black/40 p-4 text-sm backdrop-blur-lg">
            <div className="rounded-xl border border-white/20 bg-white/5 p-4 shadow-lg">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Tarefas totais
              </span>
              <p className="mt-2 text-3xl font-bold text-white">
                {loading ? '—' : pagination.total}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-xs text-gray-400">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                Atualizadas em tempo real
              </span>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-4 shadow-lg">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Concluídas
              </span>
              <p className="mt-2 text-3xl font-bold text-red-500">
                {loading ? '—' : completedCount}
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 ${mapProgressToClass(
                    progressPercentage
                  )}`}
                ></div>
              </div>
              <span className="mt-2 block text-xs text-red-400">
                {loading ? '—' : progressPercentage}% do plano concluído
              </span>
            </div>
            <div className="col-span-2 rounded-xl border border-white/20 bg-black/30 p-4 text-xs font-medium shadow-inner backdrop-blur">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-lg border border-red-500/30">
                  🔍
                </span>
                <span className="text-gray-300">
                  {activeFilters.hasFilters
                    ? `Filtros ativos: ${activeFilters.count}`
                    : 'Nenhum filtro aplicado. Personalize para ver diferentes perspectivas.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FiltersBar
        filters={filters}
        names={names}
        onFilterChange={(newFilters) => {
          setFilters(newFilters)
          setPagination((prev) => ({ ...prev, page: 1 }))
        }}
      />
      <section className="glass-panel px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-400">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            <p className="text-sm font-medium">
              Carregando tarefas com seus filtros selecionados...
            </p>
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl border border-red-500/20">
              📋
            </span>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-sm text-gray-300">
                Ajuste seus filtros ou crie uma nova tarefa para começar a sua
                jornada de organização.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/todos/new"
                className="btn btn-primary"
              >
                + Criar tarefa
              </Link>
              <button
                onClick={() =>
                  setFilters({
                    priority: [],
                    nameId: '',
                    dateFrom: '',
                    dateTo: '',
                    sort: 'createdAt_desc',
                  })
                }
                className="btn btn-ghost"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {todos.map((todo, index) => (
                <div
                  key={todo.id}
                  className="animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <TodoCard
                    todo={todo}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/20 bg-black/30 px-6 py-4 text-sm shadow-sm backdrop-blur">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-4 py-1 text-xs font-medium text-gray-400 shadow-sm backdrop-blur">
                  <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                  Controle de páginas ativo
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-semibold text-gray-300 transition enabled:hover:-translate-y-0.5 enabled:hover:border-red-500/50 enabled:hover:text-white disabled:opacity-40 disabled:shadow-none backdrop-blur"
                  >
                    Anterior
                  </button>
                  <span className="text-sm font-medium text-gray-300">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.totalPages, prev.page + 1),
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-full border border-transparent bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow enabled:hover:shadow-red-500/30 disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}