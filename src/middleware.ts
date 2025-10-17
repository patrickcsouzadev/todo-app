import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, createRateLimitHeaders } from '@/lib/rateLimiting'
import { validateRequest } from './lib/waf'

const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:;",
}

const PRODUCTION_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 20,
  },
  api: {
    windowMs: 15 * 60 * 1000,
    maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 100,
  },
  test: {
    windowMs: 60 * 1000,
    maxRequests: process.env.NODE_ENV === 'development' ? 100 : 10,
  },
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  if (process.env.NODE_ENV === 'production' && process.env.WAF_ENABLED === 'true') {
    try {
      const wafResult = await validateRequest(request)
      if (!wafResult.allowed) {
        if (wafResult.wafResult.blocked) {
          return new Response(
            JSON.stringify({
              error: 'Request blocked by security policy',
              code: 'WAF_BLOCKED',
              timestamp: new Date().toISOString()
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                'X-WAF-Action': 'BLOCK',
                'X-WAF-Risk-Score': wafResult.wafResult.riskScore.toString()
              }
            }
          )
        }
        
        if (wafResult.wafResult.challenged) {
          return new Response(
            JSON.stringify({
              error: 'Additional verification required',
              code: 'WAF_CHALLENGE',
              timestamp: new Date().toISOString()
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'X-WAF-Action': 'CHALLENGE',
                'Retry-After': '60'
              }
            }
          )
        }
      }
    } catch (error) {
      console.error('WAF validation error:', error)
    }
  }

  if (process.env.NODE_ENV === 'production' && pathname.startsWith('/api/test/')) {
    return NextResponse.json(
      { ok: false, error: 'Not found' },
      { status: 404 }
    )
  }

  let config = rateLimitConfigs.api

  if (pathname.startsWith('/api/auth/')) {
    config = rateLimitConfigs.auth
  } else if (pathname.startsWith('/api/test/')) {
    config = rateLimitConfigs.test
  }

  const { allowed, remaining, resetTime } = checkRateLimit(request, config)

  if (!allowed) {
    const response = NextResponse.json(
      { 
        ok: false, 
        error: 'Muitas requisições. Tente novamente mais tarde.',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      },
      { status: 429 }
    )

    const headers = createRateLimitHeaders(allowed, remaining, resetTime)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  const response = NextResponse.next()

  const rateLimitHeaders = createRateLimitHeaders(allowed, remaining, resetTime)
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  if (process.env.NODE_ENV === 'production') {
    Object.entries(PRODUCTION_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  const origin = request.headers.get('origin')

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/auth/:path*',
  ],
}
