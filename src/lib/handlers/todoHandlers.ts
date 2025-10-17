export const handleDeleteTodo = async (
  todoId: string,
  setIsDeleting: (loading: boolean) => void,
  onDelete: (id: string) => void
) => {
  setIsDeleting(true)
  try {
    const res = await fetch(`/api/todos/${todoId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    })
    const data = await res.json().catch(() => ({ ok: false }))
    if (res.ok && data.ok) {
      onDelete(todoId)
    } else {
      console.error('Failed to delete todo on server:', data)
      throw new Error(data.error || 'Failed to delete')
    }
  } finally {
    setIsDeleting(false)
  }
}
export const handleShowDeleteConfirm = (
  setShowDeleteConfirm: (show: boolean) => void
) => {
  setShowDeleteConfirm(true)
}
export const handleCancelDelete = (
  setShowDeleteConfirm: (show: boolean) => void
) => {
  setShowDeleteConfirm(false)
}
export const handleToggleComplete = (
  todoId: string,
  onToggleComplete: (id: string) => void
) => {
  onToggleComplete(todoId)
}