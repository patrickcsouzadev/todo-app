import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
type AuthType = 'login' | 'register' | 'request-reset' | 'reset'
interface AuthFormData {
  email: string
  password: string
  newPassword: string
}
export function useAuthForm(type: AuthType, token?: string) {
  const router = useRouter()
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    newPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log('🔵 [useAuthForm] Formulário enviado - Tipo:', type)
    console.log('🔵 [useAuthForm] Dados do formulário:', {
      email: formData.email,
      hasPassword: !!formData.password,
      hasNewPassword: !!formData.newPassword
    })

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      let endpoint = ''
      let body: Record<string, unknown> = {}
      switch (type) {
        case 'register':
          endpoint = '/api/auth/register'
          body = { email: formData.email, password: formData.password }
          break
        case 'login':
          endpoint = '/api/auth/login'
          body = { email: formData.email, password: formData.password }
          break
        case 'request-reset':
          endpoint = '/api/auth/request-reset'
          body = { email: formData.email }
          break
        case 'reset':
          endpoint = '/api/auth/reset'
          body = { token, newPassword: formData.newPassword }
          break
      }

      console.log('🔵 [useAuthForm] Enviando requisição para:', endpoint)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      console.log('🔵 [useAuthForm] Resposta recebida - Status:', response.status)

      const data = await response.json()
      console.log('🔵 [useAuthForm] Dados da resposta:', data)

      if (!data.ok) {
        console.log('❌ [useAuthForm] Erro na resposta:', data.error)
        setError(data.error || 'Ocorreu um erro')
        // garantir que loading seja desligado antes de sair
        setLoading(false)
        return
      }

      console.log('✅ [useAuthForm] Sucesso:', data.message)
      setSuccess(data.message || 'Sucesso!')

      if (type === 'login') {
        console.log('🔵 [useAuthForm] Redirecionando para dashboard')
        router.push('/dashboard')
      } else if (type === 'register' || type === 'request-reset') {
        console.log('🔵 [useAuthForm] Aguardando 3s antes de redirecionar')
        setTimeout(() => {
          if (type === 'register') {
            console.log('🔵 [useAuthForm] Redirecionando para login')
            router.push('/auth/login')
          }
        }, 3000)
      } else if (type === 'reset') {
        console.log('🔵 [useAuthForm] Aguardando 2s antes de redirecionar')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (err) {
      console.error('❌ [useAuthForm] Erro de conexão:', err)
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }
  return {
    formData,
    setFormData,
    loading,
    error,
    success,
    handleSubmit,
  }
}