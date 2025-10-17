import * as cheerio from 'cheerio'

interface LinkPreview {
  image?: string
  title?: string
  description?: string
}

const cache = new Map<string, { data: LinkPreview; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254',
  '::1',
  '[::]',
  'metadata.google.internal',
]

const BLOCKED_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^::1$/,
  /^fe80:/,
  /^fc00:/,
]

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024

function validateUrl(url: string): void {
  try {
    const urlObj = new URL(url)

    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Protocolo não permitido')
    }

    const hostname = urlObj.hostname.toLowerCase()

    if (BLOCKED_HOSTS.includes(hostname)) {
      throw new Error('Host bloqueado')
    }

    if (BLOCKED_IP_RANGES.some(regex => regex.test(hostname))) {
      throw new Error('Range de IP não permitido')
    }

    const port = urlObj.port
    if (port && !['80', '443', ''].includes(port)) {
      throw new Error('Porta não permitida')
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('URL inválida')
    }
    throw error
  }
}

function sanitizeImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined

  try {
    const urlObj = new URL(imageUrl)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return undefined
    }
    return imageUrl
  } catch {
    return undefined
  }
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  try {
    validateUrl(url)
  } catch (error) {
    console.error('❌ URL validation failed:', error)
    return {}
  }

  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    if (url.includes('shopee.com')) {
      const shopeePreview = await fetchShopeePreview(url)
      if (shopeePreview.image) {
        cache.set(url, { data: shopeePreview, timestamp: Date.now() })
        return shopeePreview
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      throw new Error('Response muito grande')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    let receivedLength = 0
    const chunks: Uint8Array[] = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      receivedLength += value.length
      if (receivedLength > MAX_RESPONSE_SIZE) {
        reader.cancel()
        throw new Error('Response excedeu limite de tamanho')
      }
      chunks.push(value)
    }

    const chunksAll = new Uint8Array(receivedLength)
    let position = 0
    for (const chunk of chunks) {
      chunksAll.set(chunk, position)
      position += chunk.length
    }

    const html = new TextDecoder('utf-8').decode(chunksAll)
    const $ = cheerio.load(html)

    let image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content')

    if (!image) {
      const firstImg = $('img').first().attr('src')
      if (firstImg) {
        image = firstImg
      }
    }

    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url)
      if (image.startsWith('//')) {
        image = urlObj.protocol + image
      } else if (image.startsWith('/')) {
        image = urlObj.origin + image
      } else {
        image = new URL(image, url).href
      }
    }

    image = sanitizeImageUrl(image)

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      undefined

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      undefined

    const preview: LinkPreview = {
      image,
      title: title?.substring(0, 200),
      description: description?.substring(0, 500),
    }

    cache.set(url, { data: preview, timestamp: Date.now() })

    return preview
  } catch (error) {
    return {}
  }
}

async function fetchShopeePreview(url: string): Promise<LinkPreview> {
  try {
    const match = url.match(/i\.(\d+)\.(\d+)/)
    if (!match) {
      return {}
    }

    return {
      image: 'https://cf.shopee.com.br/file/' + match[1],
      title: 'Produto Shopee',
      description: 'Clique para ver detalhes do produto',
    }
  } catch (error) {
    return {}
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key)
    }
  }
}, 60 * 60 * 1000)
