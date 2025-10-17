import { useRouter } from 'next/navigation'
export const handleLogout = async (router: ReturnType<typeof useRouter>) => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch (error) {
    console.error('Error logging out:', error)
  } finally {
    router.push('/auth/login')
    router.refresh()
  }
}
export const handleLoginRedirect = (
  router: ReturnType<typeof useRouter>,
  redirectTo?: string
) => {
  const redirectUrl = redirectTo || '/dashboard'
  router.push(redirectUrl)
}
export const handleAuthError = (error: any, setError: (error: string) => void) => {
  if (error.response?.status === 401) {
    setError('Email ou senha incorretos')
  } else if (error.response?.status === 429) {
    setError('Muitas tentativas. Tente novamente em alguns minutos')
  } else {
    setError('Erro interno. Tente novamente')
  }
}
export const handlePasswordReset = async (
  email: string,
  setSuccess: (message: string) => void,
  setError: (error: string) => void
) => {
  try {
    const response = await fetch('/api/auth/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    if (data.ok) {
      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.')
    } else {
      setError(data.error || 'Erro ao enviar email')
    }
  } catch (error) {
    setError('Erro de conexão. Tente novamente.')
  }
}



