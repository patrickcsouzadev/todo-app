interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: Request) => string
}

const DEFAULT_KEY_GENERATOR = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}

export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  }
): { allowed: boolean; remaining: number; resetTime: number } {
  const adjustedConfig = config

  const key = adjustedConfig.keyGenerator ? adjustedConfig.keyGenerator(request) : DEFAULT_KEY_GENERATOR(request)
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + adjustedConfig.windowMs,
    }
    rateLimitStore.set(key, entry)
  }

  entry.count++

  const allowed = entry.count <= adjustedConfig.maxRequests
  const remaining = Math.max(0, adjustedConfig.maxRequests - entry.count)

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  }
}

export function createRateLimitHeaders(
  allowed: boolean,
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    ...(allowed ? {} : { 'Retry-After': '900' }),
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 1000)
