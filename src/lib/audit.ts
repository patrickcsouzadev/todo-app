import { prisma } from './prisma'
import { NextRequest } from 'next/server'

export type AuditAction = 
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'USER_CONFIRM_EMAIL'
  | 'USER_REQUEST_RESET'
  | 'USER_RESET_PASSWORD'
  | 'USER_ENABLE_MFA'
  | 'USER_DISABLE_MFA'
  | 'USER_VERIFY_MFA'
  | 'USER_SETUP_MFA'
  | 'TODO_CREATE'
  | 'TODO_UPDATE'
  | 'TODO_DELETE'
  | 'TODO_COMPLETE'
  | 'NAME_CREATE'
  | 'NAME_UPDATE'
  | 'NAME_DELETE'
  | 'PASSWORD_CHANGE'
  | 'SUSPICIOUS_ACTIVITY'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_TOKEN'
  | 'UNAUTHORIZED_ACCESS'

export type ResourceType = 
  | 'USER'
  | 'TODO'
  | 'NAME'
  | 'TOKEN'
  | 'SESSION'

export interface AuditLogEntry {
  userId: string
  action: AuditAction
  resourceType?: ResourceType
  resourceId?: string
  ip: string
  userAgent?: string
  metadata?: Record<string, any>
}

export interface SecurityEventEntry {
  eventType: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  sourceIp: string
  userAgent?: string
  userId?: string
  metadata?: Record<string, any>
}

/**
 * Extrai informações de IP e User-Agent da requisição
 */
export function extractRequestInfo(request: NextRequest): {
  ip: string
  userAgent: string | undefined
} {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  const userAgent = request.headers.get('user-agent') || undefined
  
  return { ip, userAgent }
}

/**
 * Registra um evento de auditoria
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        ip: entry.ip,
        userAgent: entry.userAgent,
        metadata: entry.metadata || {}
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to log audit event:', error)
    }
  }
}

/**
 * Registra um evento de segurança
 */
export async function logSecurityEvent(entry: SecurityEventEntry): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        eventType: entry.eventType,
        severity: entry.severity,
        description: entry.description,
        sourceIp: entry.sourceIp,
        userAgent: entry.userAgent,
        userId: entry.userId,
        metadata: entry.metadata || {},
        resolved: false
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to log security event:', error)
    }
  }
}

/**
 * Registra tentativa de login
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  ip: string,
  userAgent: string | null,
  userId?: string,
  failureReason?: string
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        email,
        success,
        ip,
        userAgent,
        userId,
        failureReason
      }
    })
    
    if (success && userId) {
      await logAuditEvent({
        userId,
        action: 'USER_LOGIN',
        ip,
        userAgent,
        metadata: { email }
      })
    }
    
    // Log security event if suspicious
    if (!success) {
      await logSecurityEvent({
        eventType: 'FAILED_LOGIN_ATTEMPT',
        severity: 'MEDIUM',
        description: `Failed login attempt for email: ${email}`,
        sourceIp: ip,
        userAgent,
        userId,
        metadata: { email, failureReason }
      })
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to log login attempt:', error)
    }
  }
}

/**
 * Registra ação de usuário em recurso
 */
export async function logUserAction(
  userId: string,
  action: AuditAction,
  resourceType: ResourceType,
  resourceId: string,
  request: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const { ip, userAgent } = extractRequestInfo(request)
  
  await logAuditEvent({
    userId,
    action,
    resourceType,
    resourceId,
    ip,
    userAgent,
    metadata
  })
}

/**
 * Registra atividade suspeita
 */
export async function logSuspiciousActivity(
  description: string,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  request: NextRequest,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const { ip, userAgent } = extractRequestInfo(request)
  
  await logSecurityEvent({
    eventType: 'SUSPICIOUS_ACTIVITY',
    severity,
    description,
    sourceIp: ip,
    userAgent,
    userId,
    metadata
  })
}

/**
 * Registra violação de rate limit
 */
export async function logRateLimitViolation(
  endpoint: string,
  ip: string,
  userAgent: string | null,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logSecurityEvent({
    eventType: 'RATE_LIMIT_EXCEEDED',
    severity: 'MEDIUM',
    description: `Rate limit exceeded for endpoint: ${endpoint}`,
    sourceIp: ip,
    userAgent,
    userId,
    metadata: { endpoint, ...metadata }
  })
}

/**
 * Registra acesso não autorizado
 */
export async function logUnauthorizedAccess(
  resourceType: string,
  resourceId: string,
  request: NextRequest,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const { ip, userAgent } = extractRequestInfo(request)
  
  await logSecurityEvent({
    eventType: 'UNAUTHORIZED_ACCESS',
    severity: 'HIGH',
    description: `Unauthorized access attempt to ${resourceType}: ${resourceId}`,
    sourceIp: ip,
    userAgent,
    userId,
    metadata: { resourceType, resourceId, ...metadata }
  })
}

/**
 * Registra token inválido
 */
export async function logInvalidToken(
  tokenType: string,
  request: NextRequest,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const { ip, userAgent } = extractRequestInfo(request)
  
  await logSecurityEvent({
    eventType: 'INVALID_TOKEN',
    severity: 'MEDIUM',
    description: `Invalid ${tokenType} token used`,
    sourceIp: ip,
    userAgent,
    userId,
    metadata: { tokenType, ...metadata }
  })
}

/**
 * Obtém logs de auditoria de um usuário
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  return await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  })
}

/**
 * Obtém eventos de segurança recentes
 */
export async function getRecentSecurityEvents(
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  limit: number = 100
) {
  return await prisma.securityEvent.findMany({
    where: severity ? { severity } : {},
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

/**
 * Marca evento de segurança como resolvido
 */
export async function resolveSecurityEvent(eventId: string): Promise<void> {
  await prisma.securityEvent.update({
    where: { id: eventId },
    data: { resolved: true }
  })
}

/**
 * Obtém estatísticas de tentativas de login
 */
export async function getLoginAttemptStats(
  email?: string,
  ip?: string,
  hours: number = 24
) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  
  const where: any = {
    createdAt: { gte: since }
  }
  
  if (email) where.email = email
  if (ip) where.ip = ip
  
  const [total, successful, failed] = await Promise.all([
    prisma.loginAttempt.count({ where }),
    prisma.loginAttempt.count({ where: { ...where, success: true } }),
    prisma.loginAttempt.count({ where: { ...where, success: false } })
  ])
  
  return { total, successful, failed }
}

/**
 * Limpa logs antigos (executar como cron job)
 */
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<{
  auditLogsDeleted: number
  securityEventsDeleted: number
  loginAttemptsDeleted: number
}> {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
  
  const [auditLogsDeleted, securityEventsDeleted, loginAttemptsDeleted] = await Promise.all([
    prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } }
    }),
    prisma.securityEvent.deleteMany({
      where: { 
        createdAt: { lt: cutoffDate },
        resolved: true
      }
    }),
    prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: cutoffDate } }
    })
  ])
  
  return {
    auditLogsDeleted: auditLogsDeleted.count,
    securityEventsDeleted: securityEventsDeleted.count,
    loginAttemptsDeleted: loginAttemptsDeleted.count
  }
}

