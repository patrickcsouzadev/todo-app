import { prisma } from './prisma'
// import { NextRequest } from 'next/server'

export interface AnomalyDetectionConfig {
  maxFailedLogins: number
  timeWindowMinutes: number
  maxRequestsPerMinute: number
  suspiciousCountries: string[]
  maxLoginAttemptsPerIP: number
  maxPasswordResetAttempts: number
}

export interface AnomalyResult {
  isAnomaly: boolean
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  metadata: Record<string, any>
}

export interface LoginPattern {
  email: string
  ip: string
  userAgent: string
  timestamp: Date
  success: boolean
}

export interface RequestPattern {
  ip: string
  endpoint: string
  timestamp: Date
  userAgent?: string
}

const DEFAULT_CONFIG: AnomalyDetectionConfig = {
  maxFailedLogins: 5,
  timeWindowMinutes: 15,
  maxRequestsPerMinute: 60,
  suspiciousCountries: [],
  maxLoginAttemptsPerIP: 10,
  maxPasswordResetAttempts: 3
}

export async function detectBruteForceLogin(
  email: string,
  ip: string,
  config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Promise<AnomalyResult> {
  const timeWindow = new Date(Date.now() - config.timeWindowMinutes * 60 * 1000)
  
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: { gte: timeWindow }
    }
  })
  
  if (failedAttempts >= config.maxFailedLogins) {
    return {
      isAnomaly: true,
      severity: 'HIGH',
      description: `Multiple failed login attempts detected for email: ${email}`,
      metadata: {
        email,
        ip,
        failedAttempts,
        timeWindowMinutes: config.timeWindowMinutes
      }
    }
  }
  
  return {
    isAnomaly: false,
    severity: 'LOW',
    description: 'No brute force detected',
    metadata: { email, ip, failedAttempts }
  }
}

export async function detectIPBruteForce(
  ip: string,
  config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Promise<AnomalyResult> {
  const timeWindow = new Date(Date.now() - config.timeWindowMinutes * 60 * 1000)
  
  const loginAttempts = await prisma.loginAttempt.count({
    where: {
      ip,
      createdAt: { gte: timeWindow }
    }
  })
  
  if (loginAttempts >= config.maxLoginAttemptsPerIP) {
    return {
      isAnomaly: true,
      severity: 'HIGH',
      description: `Multiple login attempts from IP: ${ip}`,
      metadata: {
        ip,
        loginAttempts,
        timeWindowMinutes: config.timeWindowMinutes
      }
    }
  }
  
  return {
    isAnomaly: false,
    severity: 'LOW',
    description: 'No IP brute force detected',
    metadata: { ip, loginAttempts }
  }
}

export async function detectAccessPatternAnomaly(
  userId: string,
  ip: string,
  userAgent: string | null,
  config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Promise<AnomalyResult> {
  const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const recentLogins = await prisma.auditLog.findMany({
    where: {
      userId,
      action: 'USER_LOGIN',
      createdAt: { gte: timeWindow }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  const knownIPs = new Set(recentLogins.map(login => login.ip))
  const knownUserAgents = new Set(recentLogins.map(login => login.userAgent).filter(Boolean))
  
  const isNewIP = !knownIPs.has(ip)
  const isNewUserAgent = userAgent && !knownUserAgents.has(userAgent)
  
  if (isNewIP && isNewUserAgent) {
    return {
      isAnomaly: true,
      severity: 'MEDIUM',
      description: 'Login from new IP and User-Agent combination',
      metadata: {
        userId,
        ip,
        userAgent,
        isNewIP,
        isNewUserAgent,
        recentLoginCount: recentLogins.length
      }
    }
  } else if (isNewIP) {
    return {
      isAnomaly: true,
      severity: 'LOW',
      description: 'Login from new IP address',
      metadata: {
        userId,
        ip,
        userAgent,
        isNewIP,
        isNewUserAgent,
        recentLoginCount: recentLogins.length
      }
    }
  }
  
  return {
    isAnomaly: false,
    severity: 'LOW',
    description: 'Normal access pattern',
    metadata: { userId, ip, userAgent }
  }
}

export async function detectPasswordResetAbuse(
  email: string,
  ip: string,
  config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Promise<AnomalyResult> {
  const timeWindow = new Date(Date.now() - 60 * 60 * 1000)
  
  const resetAttempts = await prisma.auditLog.count({
    where: {
      action: 'USER_REQUEST_RESET',
      metadata: {
        path: ['email'],
        equals: email
      },
      createdAt: { gte: timeWindow }
    }
  })
  
  if (resetAttempts >= config.maxPasswordResetAttempts) {
    return {
      isAnomaly: true,
      severity: 'MEDIUM',
      description: `Excessive password reset attempts for email: ${email}`,
      metadata: {
        email,
        ip,
        resetAttempts,
        timeWindowHours: 1
      }
    }
  }
  
  return {
    isAnomaly: false,
    severity: 'LOW',
    description: 'Normal password reset pattern',
    metadata: { email, ip, resetAttempts }
  }
}

export async function detectMFAAnomaly(
  userId: string,
  ip: string,
  success: boolean
): Promise<AnomalyResult> {
  const timeWindow = new Date(Date.now() - 60 * 60 * 1000)
  
  const mfaAttempts = await prisma.auditLog.count({
    where: {
      userId,
      action: 'USER_VERIFY_MFA',
      createdAt: { gte: timeWindow }
    }
  })
  
  if (!success && mfaAttempts >= 5) {
    return {
      isAnomaly: true,
      severity: 'HIGH',
      description: 'Multiple failed MFA attempts',
      metadata: {
        userId,
        ip,
        mfaAttempts,
        success
      }
    }
  }
  
  return {
    isAnomaly: false,
    severity: 'LOW',
    description: 'Normal MFA activity',
    metadata: { userId, ip, mfaAttempts, success }
  }
}

export async function detectRateLimitAnomaly(
  ip: string,
  endpoint: string,
  config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Promise<AnomalyResult> {
  const timeWindow = new Date(Date.now() - 60 * 1000)
  
  const requests = await prisma.rateLimitEntry.count({
    where: {
      key: ip,
      endpoint,
      windowStart: { gte: timeWindow }
    }
  })
  
  if (requests >= config.maxRequestsPerMinute) {
    return {
      isAnomaly: true,
      severity: 'MEDIUM',
      description: `Rate limit exceeded for IP: ${ip} on endpoint: ${endpoint}`,
      metadata: {
        ip,
        endpoint,
        requests,
        maxAllowed: config.maxRequestsPerMinute
      }
    }
  }
  
  return {
    isAnomaly: false,
    severity: 'LOW',
    description: 'Normal request rate',
    metadata: { ip, endpoint, requests }
  }
}

export async function detectPrivilegeEscalation(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: string
): Promise<AnomalyResult> {
  const unauthorizedAccess = await prisma.auditLog.count({
    where: {
      userId,
      action: 'UNAUTHORIZED_ACCESS',
      resourceType,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000)
      }
    }
  })
  
  if (unauthorizedAccess >= 3) {
    return {
      isAnomaly: true,
      severity: 'CRITICAL',
      description: 'Multiple unauthorized access attempts detected',
      metadata: {
        userId,
        resourceType,
        resourceId,
        action,
        unauthorizedAccessCount: unauthorizedAccess
      }
    }
  }
  
  return {
    isAnomaly: false,
    severity: 'LOW',
    description: 'No privilege escalation detected',
    metadata: { userId, resourceType, resourceId, action }
  }
}

export async function detectLoginAnomalies(
  email: string,
  ip: string,
  userAgent: string | null,
  userId?: string,
  success: boolean = false,
  config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Promise<AnomalyResult[]> {
  const anomalies: AnomalyResult[] = []
  
  const bruteForceResult = await detectBruteForceLogin(email, ip, config)
  if (bruteForceResult.isAnomaly) {
    anomalies.push(bruteForceResult)
  }
  
  const ipBruteForceResult = await detectIPBruteForce(ip, config)
  if (ipBruteForceResult.isAnomaly) {
    anomalies.push(ipBruteForceResult)
  }
  
  if (success && userId) {
    const accessPatternResult = await detectAccessPatternAnomaly(userId, ip, userAgent, config)
    if (accessPatternResult.isAnomaly) {
      anomalies.push(accessPatternResult)
    }
  }
  
  return anomalies
}

export async function detectActionAnomalies(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  ip: string,
  userAgent: string | null
): Promise<AnomalyResult[]> {
  const anomalies: AnomalyResult[] = []
  
  const privilegeEscalationResult = await detectPrivilegeEscalation(
    userId,
    resourceType,
    resourceId,
    action
  )
  
  if (privilegeEscalationResult.isAnomaly) {
    anomalies.push(privilegeEscalationResult)
  }
  
  return anomalies
}

export async function detectRateLimitAnomalies(
  ip: string,
  endpoint: string,
  config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Promise<AnomalyResult[]> {
  const anomalies: AnomalyResult[] = []
  
  const rateLimitResult = await detectRateLimitAnomaly(ip, endpoint, config)
  if (rateLimitResult.isAnomaly) {
    anomalies.push(rateLimitResult)
  }
  
  return anomalies
}

export async function getAnomalyStats(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  
  const [totalEvents, resolvedEvents, criticalEvents] = await Promise.all([
    prisma.securityEvent.count({
      where: { createdAt: { gte: since } }
    }),
    prisma.securityEvent.count({
      where: { 
        createdAt: { gte: since },
        resolved: true
      }
    }),
    prisma.securityEvent.count({
      where: { 
        createdAt: { gte: since },
        severity: 'CRITICAL'
      }
    })
  ])
  
  return {
    totalEvents,
    resolvedEvents,
    criticalEvents,
    unresolvedEvents: totalEvents - resolvedEvents
  }
}
