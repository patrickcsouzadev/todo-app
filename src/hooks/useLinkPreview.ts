import { useState, useEffect } from 'react'
interface LinkPreviewData {
  image?: string
  title?: string
  description?: string
}
export function useLinkPreview(url: string) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!url) {
      setPreview(null)
      return
    }
    const fetchPreview = async () => {
      setLoading(true)
      setError(false)
      try {
        const response = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`
        )
        const data = await response.json()
        if (data.ok) {
          setPreview(data.data)
        } else {
          setError(true)
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(fetchPreview, 500)
    return () => clearTimeout(timer)
  }, [url])
  return { preview, loading, error }
}