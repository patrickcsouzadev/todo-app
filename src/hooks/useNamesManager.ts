import { useState } from 'react'
import { useNames, Name } from './useNames'
import { handleCreateName, handleUpdateName, handleDeleteName } from '@/lib/handlers/nameHandlers'
export function useNamesManager() {
  const { names, setNames, loading } = useNames()
  const [newNameLabel, setNewNameLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const createName = async () => {
    if (!newNameLabel.trim()) return
    setIsCreating(true)
    await handleCreateName(
      newNameLabel.trim(),
      (name: Name) => {
        setNames((prev) => [...prev, name])
        setNewNameLabel('')
      },
      () => setIsCreating(false)
    )
    setIsCreating(false)
  }
  const updateName = async (id: string) => {
    if (!editingLabel.trim()) return
    await handleUpdateName(
      id,
      editingLabel.trim(),
      (updatedName: Name) => {
        setNames((prev) => prev.map((n) => (n.id === id ? updatedName : n)))
        setEditingId(null)
        setEditingLabel('')
      }
    )
  }
  const deleteName = async (id: string) => {
    if (
      !confirm(
        'Tem certeza? Todas as tarefas associadas a esta pessoa serão deletadas.'
      )
    ) {
      return
    }
    await handleDeleteName(
      id,
      () => {
        setNames((prev) => prev.filter((n) => n.id !== id))
      },
      (err) => {
        console.error('Erro ao deletar nome (client):', err)
      }
    )
  }
  return {
    names,
    loading,
    newNameLabel,
    setNewNameLabel,
    editingId,
    setEditingId,
    editingLabel,
    setEditingLabel,
    isCreating,
    createName,
    updateName,
    deleteName,
  }
}