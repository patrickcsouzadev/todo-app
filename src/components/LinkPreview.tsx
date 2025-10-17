'use client'
import { useLinkPreview } from '@/hooks/useLinkPreview'
import { handleImageLoadError } from '@/lib/handlers/imageHandlers'
interface LinkPreviewProps {
  url: string
}
export function LinkPreview({ url }: LinkPreviewProps) {
  const { preview, loading, error } = useLinkPreview(url)
  if (!url) return null
  if (loading) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }
  if (error || !preview) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Não foi possível carregar o preview do link
        </p>
      </div>
    )
  }
  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {preview.image && (
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-700">
          <img
            src={`/api/image-proxy?url=${encodeURIComponent(preview.image)}`}
            alt={preview.title || 'Preview do link'}
            className="w-full h-full object-cover"
            onError={handleImageLoadError(preview.image)}
          />
        </div>
      )}
      <div className="p-4">
        {preview.title && (
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {preview.title}
          </h4>
        )}
        {preview.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {preview.description}
          </p>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-2 inline-flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Abrir link
        </a>
      </div>
    </div>
  )
}