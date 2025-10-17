'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ConfirmContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const processedRef = useRef(false)

  useEffect(() => {
    const executionId = Math.random().toString(36).substring(7)
    console.log(`[${executionId}] 🔄 useEffect EXECUTADO`)

    if (processedRef.current) {
      console.log(`[${executionId}] ⚠️ Já processado (ref), ignorando`)
      return
    }

    console.log(`[${executionId}] ✅ ConfirmContent carregado`)
    const statusParam = searchParams.get('status')
    const messageParam = searchParams.get('message')
    const token = searchParams.get('token')

    const processedToken = typeof window !== 'undefined' ? sessionStorage.getItem('processed_confirm_token') : null
    if (token && processedToken === token) {
      console.log(`[${executionId}] ⚠️ Token já processado anteriormente, ignorando`)
      processedRef.current = true
      if (statusParam === 'success' || messageParam) {
        setStatus('success')
        setMessage(messageParam || 'Email confirmado com sucesso!')
        setTimeout(() => router.push('/auth/login'), 3000)
      }
      return
    }

    processedRef.current = true

    console.log(`[${executionId}] 🔍 ConfirmPage - Status:`, statusParam, 'Token:', token ? token.substring(0, 10) + '...' : 'null')
    console.log(`[${executionId}] 📍 URL completa:`, window.location.href)

    if (statusParam || messageParam) {
      console.log(`[${executionId}] ✅ Fluxo com status/mensagem detectado`, { statusParam, messageParam })
      if (messageParam) {
        setMessage(messageParam)
      }
      switch (statusParam) {
        case 'ready':
          break
        case 'already':
          setStatus('success')
          setMessage((msg) => msg || 'Conta já confirmada anteriormente. Você pode fazer login.')
          setTimeout(() => router.push('/auth/login'), 3000)
          return
        case 'invalid':
        case 'missing':
          setStatus('error')
          setMessage((msg) => msg || 'Link de confirmação inválido ou expirado.')
          return
        case 'success':
          setStatus('success')
          setMessage((msg) => msg || 'Email confirmado com sucesso!')
          setTimeout(() => router.push('/auth/login'), 3000)
          return
        default:
          if (messageParam) {
            setStatus('success')
            setTimeout(() => router.push('/auth/login'), 3000)
            return
          }
      }
    }

    if (token) {
      console.log(`[${executionId}] 🔵 Token encontrado, chamando API POST`)

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('processed_confirm_token', token)
      }

      const confirmEmail = async () => {
        try {
          console.log(`[${executionId}] 📤 Enviando POST para /api/auth/confirm`)
          const response = await fetch('/api/auth/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          })

          const data = await response.json()
          console.log(`[${executionId}] 📥 Resposta da API:`, data)

          if (data.ok) {
            console.log(`[${executionId}] ✅ Confirmação bem-sucedida`)
            setStatus('success')
            setMessage(data.message)
            setTimeout(() => {
              console.log(`[${executionId}] 🔀 Redirecionando para login`)
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('processed_confirm_token')
              }
              router.push('/auth/login')
            }, 3000)
          } else {
            console.log(`[${executionId}] ❌ Erro na confirmação:`, data.error)
            setStatus('error')
            setMessage(data.error || 'Erro ao confirmar email')
          }
        } catch (error) {
          console.error(`[${executionId}] ❌ Erro na requisição:`, error)
          setStatus('error')
          setMessage('Erro ao confirmar email. Tente novamente.')
        }
      }

      confirmEmail()
      return
    }

    console.log(`[${executionId}] ❌ Sem status e sem token na URL`)
    setStatus('error')
    setMessage('Link de confirmação inválido. Verifique o link no email.')
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-white/15 bg-white/80 dark:bg-gray-800/80 shadow-xl backdrop-blur-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Confirmando Email
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Aguarde enquanto confirmamos seu email...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Confirmado!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecionando para o login...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-red-600 text-6xl mb-4">✗</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Erro na Confirmação
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <Link
                href="/auth/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Ir para Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
