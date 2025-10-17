import { Name } from '@/hooks/useNames'
export async function handleCreateName(
  label: string,
  onSuccess: (name: Name) => void,
  onError?: (error: unknown) => void
) {
  try {
    const response = await fetch('/api/names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    const data = await response.json()
    if (data.ok) {
      onSuccess(data.data)
    }
  } catch (error) {
    console.error('Error creating name:', error)
    if (onError) onError(error)
  }
}
export async function handleUpdateName(
  id: string,
  label: string,
  onSuccess: (name: Name) => void,
  onError?: (error: unknown) => void
) {
  try {
    const response = await fetch(`/api/names/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    const data = await response.json()
    if (data.ok) {
      onSuccess(data.data)
    }
  } catch (error) {
    console.error('Error updating name:', error)
    if (onError) onError(error)
  }
}
export async function handleDeleteName(
  id: string,
  onSuccess: () => void,
  onError?: (error: unknown) => void
) {
  try {
    const response = await fetch(`/api/names/${id}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (data.ok) {
      onSuccess()
    }
  } catch (error) {
    console.error('Error deleting name:', error)
    if (onError) onError(error)
  }
}