'use client'
import Link from 'next/link'
import { useAuthForm } from '@/hooks/useAuthForm'
import { getAuthTitle, getAuthButtonText } from '@/lib/authTexts'
import { useEffect } from 'react'

interface AuthFormProps {
  type: 'login' | 'register' | 'request-reset' | 'reset'
  token?: string
}
export function AuthForm({ type, token }: AuthFormProps) {
  const { formData, setFormData, loading, error, success, handleSubmit } =
    useAuthForm(type, token)

  useEffect(() => {
    console.log('🟢 [AuthForm] Componente montado - Tipo:', type)
    console.log('🟢 [AuthForm] handleSubmit disponível:', typeof handleSubmit)
  }, [type, handleSubmit])
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="animate-float-soft absolute left-[3%] top-[12%] w-max rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-xs font-medium text-blue-100 shadow-sm shadow-blue-500/20 backdrop-blur">
          ✍️ Capture ideias antes que escapem
        </div>
        <div className="animate-float-soft-delayed absolute right-[3%] top-[16%] w-max rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-xs font-medium text-slate-100 shadow-sm shadow-slate-400/20 backdrop-blur">
          🌟 Um login rápido inicia seu dia produtivo
        </div>
        <div className="animate-fade-loop absolute left-[12%] bottom-[24%] w-max rounded-2xl border border-white/15 bg-white/6 px-5 py-3 text-xs font-medium text-slate-100 shadow-sm shadow-slate-400/20 backdrop-blur">
          ⏱️ Cada etapa concluída soma ao seu sucesso
        </div>
        <div className="animate-fade-loop-delayed absolute right-[12%] bottom-[20%] w-max rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-xs font-medium text-slate-100 shadow-sm shadow-slate-400/20 backdrop-blur">
          🚀 Continue firme: consistência gera resultados
        </div>
      </div>
  <div className="pointer-events-none absolute inset-0">
  <div className="absolute left-1/2 top-[18%] h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/18 blur-3xl" />
  <div className="absolute right-[18%] top-[32%] h-60 w-60 rounded-full bg-blue-400/14 blur-2xl" />
  <div className="absolute left-[12%] bottom-[22%] h-56 w-56 rounded-full bg-blue-300/12 blur-3xl" />
  <svg className="absolute inset-0 h-full w-full opacity-[0.05]" viewBox="0 0 800 800">
          <path
            className="animate-orbit-slow"
            stroke="url(#auth-orbit)"
            strokeWidth="0.8"
            d="M400 80C560 80 720 220 720 400C720 580 560 720 400 720C240 720 80 580 80 400C80 220 240 80 400 80Z"
          />
          <defs>
            <linearGradient id="auth-orbit" x1="80" x2="720" y1="80" y2="720" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(37, 99, 235, 0.38)" />
              <stop offset="0.55" stopColor="rgba(59, 130, 246, 0.44)" />
              <stop offset="1" stopColor="rgba(96, 165, 250, 0.36)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="relative z-40 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-12 lg:grid-cols-[1.15fr_1fr]">
          <section className="hidden rounded-3xl border border-white/12 bg-white/8 p-10 text-slate-100 shadow-xl backdrop-blur-2xl lg:block">
            <span className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              Inspiração diária
            </span>
            <h2 className="text-4xl font-semibold leading-tight">
              Uma maneira elegante de manter <span className="text-blue-200">suas tarefas</span>{' '}
              e prioridades sob controle.
            </h2>
            <p className="mt-4 text-sm text-slate-300/85">
              Cadastre tarefas, atribua responsáveis, acompanhe prioridades coloridas e visualize
              insights de produtividade em tempo real.
            </p>
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 shadow-sm shadow-blue-500/15">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-lg">
                  ✨
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Workflows inteligentes</p>
                  <p className="text-xs text-slate-300/80">
                    Automatize notificações, confirme tarefas e acompanhe o progresso do time.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 shadow-sm shadow-slate-500/10">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-300 to-blue-400 text-lg">
                  ⏱️
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Visão em tempo real</p>
                  <p className="text-xs text-slate-300/80">
                    Analise prioridades por pessoa, prazo ou categoria em um só lugar.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-blue-500/28 via-blue-400/18 to-blue-300/20 blur-3xl" />
            <div className="relative rounded-[28px] border border-white/15 bg-slate-950/85 p-10 text-white shadow-[0_40px_120px_-45px_rgba(37,99,235,0.6)] backdrop-blur-xl">
              <header className="mb-8 text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  {getAuthTitle(type)}
                </h1>
                <p className="mt-2 text-sm text-slate-300/80">
                  {type === 'register' && 'Crie sua conta para começar'}
                  {type === 'login' && 'Entre na sua conta'}
                  {type === 'request-reset' && 'Digite seu email para recuperar sua senha'}
                  {type === 'reset' && 'Digite sua nova senha e finalize o processo'}
                </p>
              </header>
              {error && (
                <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                  {success}
                </div>
              )}
              <form onSubmit={(e) => {
                console.log('🟡 [AuthForm] Form onSubmit disparado!')
                handleSubmit(e)
              }} className="space-y-5">
                {(type === 'register' || type === 'login' || type === 'request-reset') && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wide text-slate-300/80"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white shadow-inner shadow-blue-500/5 transition focus:border-blue-400/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="seu@email.com"
                    />
                  </div>
                )}
                {(type === 'register' || type === 'login') && (
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold uppercase tracking-wide text-slate-300/80"
                    >
                      Senha
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      required
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white shadow-inner shadow-blue-500/5 transition focus:border-blue-400/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="••••••••"
                    />
                    {type === 'register' && (
                      <p className="mt-1 text-xs text-slate-400">
                        Mínimo 12 caracteres, com maiúscula, minúscula, número e caractere especial (!@#$%^&*). Evite sequências comuns (123, abc, senha).
                      </p>
                    )}
                  </div>
                )}
                {type === 'reset' && (
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-semibold uppercase tracking-wide text-slate-300/80"
                    >
                      Nova Senha
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      required
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white shadow-inner shadow-blue-500/5 transition focus:border-blue-400/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Mínimo 12 caracteres, com maiúscula, minúscula, número e caractere especial (!@#$%^&*). Evite sequências comuns (123, abc, senha).
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 disabled:bg-blue-400"
                >
                  {getAuthButtonText(type, loading)}
                </button>
              </form>
              <div className="mt-6 text-center text-sm text-slate-300/90">
                {type === 'login' && (
                  <>
                    <Link href="/auth/request-reset" className="text-blue-300 transition hover:text-blue-200">
                      Esqueceu sua senha?
                    </Link>
                    <div className="mt-2">
                      <span className="text-slate-400">Não tem uma conta? </span>
                      <Link
                        href="/auth/register"
                        className="text-blue-300 font-semibold transition hover:text-blue-200"
                      >
                        Criar conta
                      </Link>
                    </div>
                  </>
                )}
                {type === 'register' && (
                  <div>
                    <span className="text-slate-400">Já tem uma conta? </span>
                    <Link
                      href="/auth/login"
                      className="text-blue-300 font-semibold transition hover:text-blue-200"
                    >
                      Entrar
                    </Link>
                  </div>
                )}
                {type === 'request-reset' && (
                  <Link href="/auth/login" className="text-blue-300 transition hover:text-blue-200">
                    Voltar para login
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}