'use client'
import { Priority } from '@prisma/client'
import { getPriorityLabel } from '@/lib/utils'
import { priorityStyles } from '@/styles/priorityStyles'
import {
  togglePriority,
  clearFilters,
  hasActiveFilters,
  getCurrentSortLabel,
  FilterState
} from '@/lib/handlers/filterHandlers'
interface FiltersBarProps {
  filters: FilterState
  names: Array<{ id: string; label: string }>
  onFilterChange: (filters: FilterState) => void
}
export function FiltersBar({ filters, names, onFilterChange }: FiltersBarProps) {
  const priorities: Priority[] = ['RED', 'YELLOW', 'BLUE']
  return (
    <section className="glass-panel relative overflow-hidden px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Filtros inteligentes
          </h3>
          <p className="text-sm text-gray-300">
            Combine prioridades, pessoas e datas para refinar sua visão.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-600/20 px-3 py-1 text-xs font-medium uppercase tracking-wide text-red-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            Atualização dinâmica
          </span>
          {hasActiveFilters(filters) && (
            <button
              onClick={() => clearFilters(onFilterChange)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium text-gray-300 shadow-sm transition hover:bg-white/20"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
            Prioridade
          </span>
          <div className="flex flex-wrap gap-3">
            {priorities.map((priority) => {
              const isActive = filters.priority.includes(priority)
              const style = priorityStyles[priority]
              return (
                <label
                  key={priority}
                  className={`priority-chip ${isActive ? `priority-chip--active priority-${priority.toLowerCase()}` : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => togglePriority(priority, filters, onFilterChange)}
                    className="sr-only"
                    aria-label={`Filtrar por prioridade ${getPriorityLabel(priority)}`}
                  />
                  <span className={`flex h-2.5 w-2.5 rounded-full priority-dot-${priority.toLowerCase()}`} />
                  <span>{getPriorityLabel(priority)}</span>
                </label>
              )
            })}
          </div>
        </div>
        <div className="space-y-3">
          <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
            Pessoa
          </span>
          <div className="relative">
            <select
              value={filters.nameId}
              onChange={(e) => onFilterChange({ ...filters, nameId: e.target.value })}
              title="Filtrar por pessoa responsável"
              aria-label="Filtrar por pessoa responsável"
              className="w-full rounded-2xl border border-white/20 bg-black/30 backdrop-blur px-4 py-3 text-sm font-medium text-gray-200 shadow-sm transition focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <option value="">Todas as pessoas</option>
              {names.map((name) => (
                <option key={name.id} value={name.id}>
                  {name.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
            Intervalo de datas
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="group relative flex flex-col gap-1 rounded-2xl border border-white/20 bg-black/30 backdrop-blur px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400 shadow-sm transition focus-within:border-red-500/50 focus-within:ring-2 focus-within:ring-red-500/30">
              Data inicial
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
                className="mt-1 border-0 bg-transparent p-0 text-sm font-semibold text-gray-200 outline-none focus:ring-0"
              />
            </label>
            <label className="group relative flex flex-col gap-1 rounded-2xl border border-white/20 bg-black/30 backdrop-blur px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400 shadow-sm transition focus-within:border-red-500/50 focus-within:ring-2 focus-within:ring-red-500/30">
              Data final
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
                className="mt-1 border-0 bg-transparent p-0 text-sm font-semibold text-gray-200 outline-none focus:ring-0"
              />
            </label>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/20 bg-black/30 backdrop-blur px-5 py-4 text-sm font-medium shadow-inner">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-lg border border-red-500/30">
            ⚙️
          </span>
          <span className="text-gray-300">
            Ordenação atual:{' '}
            <strong className="text-white">
              {getCurrentSortLabel(filters.sort)}
            </strong>
          </span>
        </div>
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
          title="Selecionar ordenação das tarefas"
          aria-label="Selecionar ordenação das tarefas"
          className="rounded-full border border-red-500/30 bg-red-600/20 backdrop-blur px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-500 shadow-sm transition focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        >
          <option value="createdAt_desc">Mais recentes primeiro</option>
          <option value="createdAt_asc">Mais antigas primeiro</option>
          <option value="priority">Por prioridade</option>
        </select>
      </div>
    </section>
  )
}