import { useState, useEffect } from 'react'
export interface Name {
  id: string
  label: string
  createdAt?: string
}
export function useNames() {
  const [names, setNames] = useState<Name[]>([])
  const [loading, setLoading] = useState(true)
  const fetchNames = async () => {
    try {
      const response = await fetch('/api/names')
      const data = await response.json()
      if (data.ok) {
        setNames(data.data)
      }
    } catch (error) {
      console.error('Error fetching names:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchNames()
  }, [])
  return { names, setNames, loading, refetch: fetchNames }
}