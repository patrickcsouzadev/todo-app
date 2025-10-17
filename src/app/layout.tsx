import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Todo App - Organize suas tarefas',
  description: 'Aplicação de gerenciamento de tarefas com autenticação',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} app-shell antialiased transition-colors duration-500`}
      >
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[-1] h-[540px] overflow-hidden">
          <div className="absolute inset-x-0 top-12 flex justify-center opacity-60 blur-3xl">
            <div className="h-48 w-[520px] bg-gradient-to-r from-blue-500/40 via-blue-400/35 to-slate-700/30 mix-blend-screen" />
          </div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 transform-gpu">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/40 via-blue-300/30 to-slate-700/30 blur-2xl" />
          </div>
        </div>
        <div className="page-wrapper">
          <header className="header-container">
            <div className="glass-panel flex items-center justify-between gap-6 px-6 py-4">
              <span className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-400 to-slate-800 text-lg text-white shadow-lg shadow-blue-500/30">
                  ✅
                </span>
                <span className="leading-tight">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Todo App
                  </span>
                  <span className="block text-base font-semibold text-slate-800 dark:text-slate-100">
                    Sua central inteligente de tarefas
                  </span>
                </span>
              </span>
            </div>
          </header>
          <main className="main-content">
            <div className="soft-container relative z-10 mt-6">
              {children}
            </div>
          </main>
          <footer className="footer-container">
            <p>
              Construído com foco em produtividade e clareza. Continue evoluindo
              seus hábitos! ✨
            </p>
          </footer>
        </div>
      </body>
    </html>
  )
}