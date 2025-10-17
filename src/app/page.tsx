import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
export default async function Home() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }
  return (
    <main className="relative overflow-hidden py-32">
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="animate-float-soft absolute left-[3%] top-[12%] w-max rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-xs font-medium text-blue-100 shadow-sm shadow-blue-500/20 backdrop-blur">
          💡 Planeje hoje para folgar amanhã
        </div>
        <div className="animate-float-soft-delayed absolute right-[3%] top-[16%] w-max rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-xs font-medium text-yellow-100 shadow-sm shadow-yellow-400/20 backdrop-blur">
          🚀 Priorize suas metas com clareza
        </div>
        <div className="animate-fade-loop absolute left-[18%] top-[6%] w-max rounded-2xl border border-white/15 bg-white/6 px-5 py-3 text-xs font-medium text-slate-100 shadow-sm shadow-slate-400/20 backdrop-blur">
          ✨ Visualize conquistas em tempo real
        </div>
        <div className="animate-fade-loop-delayed absolute right-[18%] top-[10%] w-max rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-xs font-medium text-emerald-100 shadow-sm shadow-emerald-400/20 backdrop-blur">
          🌱 Pequenos passos constroem grandes resultados
        </div>
        <div className="animate-float-soft absolute left-[6%] bottom-[20%] w-max rounded-2xl border border-white/12 bg-white/8 px-5 py-3 text-xs font-medium text-cyan-100 shadow-sm shadow-cyan-400/20 backdrop-blur">
          📆 Uma rotina leve começa com clareza
        </div>
        <div className="animate-float-soft-delayed absolute right-[6%] bottom-[24%] w-max rounded-2xl border border-white/12 bg-white/8 px-5 py-3 text-xs font-medium text-pink-100 shadow-sm shadow-pink-400/20 backdrop-blur">
          🎯 Faça da organização um hábito inspirador
        </div>
        <div className="animate-fade-loop absolute left-[20%] bottom-[10%] w-max rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-xs font-medium text-slate-100 shadow-sm shadow-slate-400/20 backdrop-blur">
          📣 Compartilhe tarefas e una o time
        </div>
        <div className="animate-fade-loop-delayed absolute right-[20%] bottom-[6%] w-max rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-xs font-medium text-slate-100 shadow-sm shadow-blue-500/20 backdrop-blur">
          💬 Celebre cada checklist concluído
        </div>
      </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between px-10 pt-6 text-xs font-medium">
        <span className="animate-fade-loop text-blue-100">🌟 Transforme sua rotina com constância</span>
        <span className="animate-fade-loop-delayed text-slate-100">🗂️ Convide sua equipe e organize tudo em conjunto</span>
      </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-between px-10 pb-8 text-xs font-medium">
        <span className="animate-float-soft text-slate-100">📆 Seus próximos passos sempre à vista</span>
        <span className="animate-float-soft-delayed text-slate-100">🤝 Produtividade compartilhada gera resultados</span>
      </div>
      <div className="relative z-40 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 lg:flex-row lg:items-center">
        <section className="flex-1 space-y-8 rounded-3xl border border-white/10 bg-white/8 p-10 text-slate-100 shadow-xl backdrop-blur-2xl">
          <span className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
            Organização inteligente
          </span>
          <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
            Centralize suas tarefas com estilo e foque no que realmente importa.
          </h1>
          <p className="max-w-2xl text-base text-slate-200/80 lg:text-lg">
            Autenticação por email, link previews automáticos e filtros avançados em uma interface
            responsiva pensada para produtividade e colaboração do time.
          </p>
            <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4 shadow-sm shadow-blue-500/15">
              <span className="text-lg">✅</span>
              <p className="mt-2 text-sm font-semibold text-white">Fluxos seguros</p>
              <p className="text-xs text-slate-200/80">
                Confirmação por email, tokens temporários e sessões protegidas.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 shadow-sm shadow-slate-500/10">
              <span className="text-lg">🎯</span>
              <p className="mt-2 text-sm font-semibold text-white">Prioridades visuais</p>
              <p className="text-xs text-slate-200/80">
                Atribua responsáveis, defina cores e acompanhe o progresso em tempo real.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full max-w-md">
          <div className="rounded-[28px] border border-white/12 bg-slate-950/80 p-10 text-center text-white shadow-[0_40px_120px_-45px_rgba(37,99,235,0.5)] backdrop-blur-xl">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 text-3xl shadow-lg shadow-blue-500/30">
              ✅
            </div>
            <h2 className="text-2xl font-semibold">Todo App</h2>
            <p className="mt-2 text-sm text-slate-300/90">
              Organize suas tarefas de forma simples, eficiente e com personalidade.
            </p>
            <div className="mt-8 space-y-4">
              <Link
                href="/auth/login"
                className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/45"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="block w-full rounded-xl border border-white/15 bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Criar Conta
              </Link>
            </div>
            <div className="mt-10 space-y-3 text-left text-xs text-slate-300/80">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-3">
                <span>🌐</span>
                <span>Autenticação por email com confirmação e recuperação de senha.</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-3">
                <span>👥</span>
                <span>Atribuições inteligentes por pessoa e prioridades coloridas.</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-3">
                <span>🔗</span>
                <span>Preview visual de links e filtros avançados por data e autor.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}