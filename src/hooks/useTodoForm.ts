import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Priority } from '@prisma/client'
interface TodoFormData {
  title: string
  description: string
  link: string
  priority: Priority
  nameId?: string | null
}
interface InitialData {
  id: string
  title: string
  description?: string | null
  link?: string | null
  priority: Priority
  nameId?: string | null
}
export function useTodoForm(initialData?: InitialData) {
  const router = useRouter()
  const [formData, setFormData] = useState<TodoFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    link: initialData?.link || '',
    priority: initialData?.priority || ('YELLOW' as Priority),
    nameId: initialData?.nameId || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = initialData
        ? `/api/todos/${initialData.id}`
        : '/api/todos'
      const method = initialData ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          nameId: formData.nameId && formData.nameId !== '' ? formData.nameId : null,
        }),
      })
      const data = await response.json()
      if (!data.ok) {
        setError(data.error || 'Erro ao salvar tarefa')
        return
      }
      router.push('/dashboard')
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  const handleCreateName = async (label: string, onNamesChange: () => void) => {
    const response = await fetch('/api/names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    const data = await response.json()
    if (data.ok) {
      setFormData((prev) => ({ ...prev, nameId: data.data.id }))
      onNamesChange()
    }
  }
  return {
    formData,
    setFormData,
    loading,
    error,
    handleSubmit,
    handleCreateName,
  }
}