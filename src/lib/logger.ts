import { NextRequest } from 'next/server'
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}
interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
  metadata?: Record<string, any>
}
class SecureLogger {
  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/password["\s]*[:=]["\s]*[^"\s,}]*/gi, 'password: "[REDACTED]"')
        .replace(/token["\s]*[:=]["\s]*[^"\s,}]*/gi, 'token: "[REDACTED]"')
        .replace(/secret["\s]*[:=]["\s]*[^"\s,}]*/gi, 'secret: "[REDACTED]"')
        .replace(/key["\s]*[:=]["\s]*[^"\s,}]*/gi, 'key: "[REDACTED]"')
        .replace(/authorization["\s]*[:=]["\s]*[^"\s,}]*/gi, 'authorization: "[REDACTED]"')
        .replace(/cookie["\s]*[:=]["\s]*[^"\s,}]*/gi, 'cookie: "[REDACTED]"')
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data }
      Object.keys(sanitized).forEach(key => {
        if (/password|token|secret|key|authorization|cookie/i.test(key)) {
          sanitized[key] = '[REDACTED]'
        } else {
          sanitized[key] = this.sanitizeData(sanitized[key])
        }
      })
      return sanitized
    }
    return data
  }
  private createLogEntry(
    level: LogLevel,
    message: string,
    request?: NextRequest,
    metadata?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message: this.sanitizeData(message),
      timestamp: new Date().toISOString(),
    }
    if (request) {
      entry.ip = request.headers.get('x-forwarded-for') || 'unknown'
      entry.userAgent = request.headers.get('user-agent') || 'unknown'
      entry.endpoint = request.nextUrl.pathname
      entry.method = request.method
    }
    if (metadata) {
      entry.metadata = this.sanitizeData(metadata)
    }
    return entry
  }
  error(message: string, request?: NextRequest, metadata?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, request, metadata)
    console.error(JSON.stringify(entry))
  }
  warn(message: string, request?: NextRequest, metadata?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.WARN, message, request, metadata)
    console.warn(JSON.stringify(entry))
  }
  info(message: string, request?: NextRequest, metadata?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.INFO, message, request, metadata)
    console.info(JSON.stringify(entry))
  }
  debug(message: string, request?: NextRequest, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, request, metadata)
      console.debug(JSON.stringify(entry))
    }
  }
  securityEvent(event: string, request: NextRequest, details?: Record<string, any>) {
    this.warn(`SECURITY_EVENT: ${event}`, request, {
      event,
      ...details,
      severity: 'high'
    })
  }
  authEvent(event: string, userId: string, request: NextRequest, success: boolean) {
    this.info(`AUTH_EVENT: ${event}`, request, {
      event,
      userId,
      success,
      severity: success ? 'low' : 'medium'
    })
  }
}
export const logger = new SecureLogger()



