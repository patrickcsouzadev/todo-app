'use client'
import { useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/AuthForm'
import { Suspense } from 'react'
function ResetContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border border-white/15 bg-white/80 dark:bg-gray-800/80 shadow-xl backdrop-blur-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Token Inválido
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              O link de recuperação de senha é inválido ou expirou.
            </p>
            <a
              href="/auth/request-reset"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Solicitar Novo Link
            </a>
          </div>
        </div>
      </div>
    )
  }
  return <AuthForm type="reset" token={token} />
}
export default function ResetPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetContent />
    </Suspense>
  )
}