import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = [
  'cdn.jsdelivr.net',
  'unpkg.com',
  'images.unsplash.com',
  'via.placeholder.com',
  'picsum.photos',
  'source.unsplash.com',
  'images-na.ssl-images-amazon.com',
  'images.amazon.com',
  'm.media-amazon.com',
  'static.netshoes.com.br',
  'static.zattini.com.br',
  'images.magazineluiza.com.br',
  'a-static.mlcdn.com.br',
  'http2.mlstatic.com',
  'cdn.shopify.com',
  'images.shopify.com',
  'pbs.twimg.com',
  'scontent.cdninstagram.com',
  'graph.facebook.com',
  'external-content.duckduckgo.com',
  'cloudfront.net',
  'cloudinary.com',
  'imgix.net',
  'akamaihd.net',
]

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

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

const MAX_IMAGE_SIZE = 10 * 1024 * 1024

function validateImageUrl(url: string): void {
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'O URL é obrigatório' },
        { status: 400 }
      )
    }

    try {
      validateImageUrl(imageUrl)
    } catch (error) {
      return NextResponse.json(
        { error: 'URL inválida ou não permitida' },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(imageUrl).origin,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Falha ao buscar imagem: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!ALLOWED_MIME_TYPES.some(type => contentType.includes(type))) {
      throw new Error('Tipo de arquivo não permitido')
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      throw new Error('Imagem muito grande')
    }

    const imageBuffer = await response.arrayBuffer()

    if (imageBuffer.byteLength > MAX_IMAGE_SIZE) {
      throw new Error('Imagem muito grande')
    }

    const origin = request.headers.get('origin')
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': allowOrigin,
      },
    })
  } catch (error) {
    const transparentPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    return new NextResponse(transparentPixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }
}
