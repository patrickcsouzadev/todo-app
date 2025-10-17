import { NextRequest } from 'next/server'
import { logSecurityEvent } from './audit'

export interface WAFRule {
  id: string
  name: string
  pattern: RegExp
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  action: 'BLOCK' | 'LOG' | 'CHALLENGE'
  description: string
}

export interface WAFResult {
  allowed: boolean
  blocked: boolean
  challenged: boolean
  matchedRules: WAFRule[]
  riskScore: number
  action: 'ALLOW' | 'BLOCK' | 'CHALLENGE'
}

const WAF_RULES: WAFRule[] = [
  {
    id: 'sql_injection_1',
    name: 'SQL Injection - Union Select',
    pattern: /union\s+select/i,
    severity: 'CRITICAL',
    action: 'BLOCK',
    description: 'Potential SQL injection using UNION SELECT'
  },
  {
    id: 'sql_injection_2',
    name: 'SQL Injection - Drop Table',
    pattern: /drop\s+table/i,
    severity: 'CRITICAL',
    action: 'BLOCK',
    description: 'Potential SQL injection using DROP TABLE'
  },
  {
    id: 'sql_injection_3',
    name: 'SQL Injection - OR 1=1',
    pattern: /or\s+1\s*=\s*1/i,
    severity: 'CRITICAL',
    action: 'BLOCK',
    description: 'Potential SQL injection using OR 1=1'
  },
  
  {
    id: 'xss_1',
    name: 'XSS - Script Tag',
    pattern: /<script[^>]*>/i,
    severity: 'HIGH',
    action: 'BLOCK',
    description: 'Potential XSS using script tags'
  },
  {
    id: 'xss_2',
    name: 'XSS - JavaScript Protocol',
    pattern: /javascript:/i,
    severity: 'HIGH',
    action: 'BLOCK',
    description: 'Potential XSS using javascript: protocol'
  },
  {
    id: 'xss_3',
    name: 'XSS - OnEvent Handlers',
    pattern: /on\w+\s*=/i,
    severity: 'HIGH',
    action: 'BLOCK',
    description: 'Potential XSS using event handlers'
  },
  
  {
    id: 'path_traversal_1',
    name: 'Path Traversal - Directory Traversal',
    pattern: /\.\.\/|\.\.\\|\.\.%2f|\.\.%5c/i,
    severity: 'HIGH',
    action: 'BLOCK',
    description: 'Potential path traversal attack'
  },

  {
    id: 'cmd_injection_1',
    name: 'Command Injection - System Commands',
    pattern: /;\s*(ls|dir|cat|type|ping|nslookup)/i,
    severity: 'CRITICAL',
    action: 'BLOCK',
    description: 'Potential command injection'
  },
  {
    id: 'cmd_injection_2',
    name: 'Command Injection - Pipe',
    pattern: /\|/,
    severity: 'MEDIUM',
    action: 'LOG',
    description: 'Potential command injection using pipe'
  },

  {
    id: 'ldap_injection_1',
    name: 'LDAP Injection - Wildcard',
    pattern: /\*\)|\(\*|\)\*|\(\*\)/,
    severity: 'HIGH',
    action: 'BLOCK',
    description: 'Potential LDAP injection using wildcards'
  },

  {
    id: 'nosql_injection_1',
    name: 'NoSQL Injection - MongoDB',
    pattern: /\$where|\$ne|\$gt|\$lt|\$regex/i,
    severity: 'HIGH',
    action: 'BLOCK',
    description: 'Potential NoSQL injection'
  },

  {
    id: 'suspicious_header_1',
    name: 'Suspicious User-Agent',
    pattern: /(sqlmap|nikto|nmap|burp|w3af|havij)/i,
    severity: 'HIGH',
    action: 'CHALLENGE',
    description: 'Suspicious User-Agent detected'
  },

  {
    id: 'file_upload_1',
    name: 'Suspicious File Extension',
    pattern: /\.(php|asp|jsp|exe|bat|cmd|sh)$/i,
    severity: 'HIGH',
    action: 'BLOCK',
    description: 'Suspicious file extension detected'
  },

  {
    id: 'hpp_1',
    name: 'HTTP Parameter Pollution',
    pattern: /&[^=&]*=&/,
    severity: 'MEDIUM',
    action: 'LOG',
    description: 'Potential HTTP Parameter Pollution'
  },

  {
    id: 'xxe_injection_1',
    name: 'XXE Injection',
    pattern: /<!ENTITY|<!DOCTYPE|SYSTEM|PUBLIC/i,
    severity: 'HIGH',
    action: 'BLOCK',
    description: 'Potential XXE injection'
  }
]

export function analyzeRequest(request: NextRequest): WAFResult {
  const matchedRules: WAFRule[] = []
  let riskScore = 0
  let shouldBlock = false
  let shouldChallenge = false
  
  const url = request.url
  const method = request.method
  const userAgent = request.headers.get('user-agent') || ''
  const contentType = request.headers.get('content-type') || ''

  const searchParams = new URL(url).searchParams
  const urlString = url + '?' + searchParams.toString()

  const requestData = {
    url: urlString,
    userAgent,
    contentType,
    method
  }

  for (const rule of WAF_RULES) {
    const patterns = [
      urlString,
      userAgent,
      contentType,
      method
    ]
    
    for (const pattern of patterns) {
      if (rule.pattern.test(pattern)) {
        matchedRules.push(rule)

        switch (rule.severity) {
          case 'CRITICAL':
            riskScore += 10
            break
          case 'HIGH':
            riskScore += 7
            break
          case 'MEDIUM':
            riskScore += 4
            break
          case 'LOW':
            riskScore += 1
            break
        }

        if (rule.action === 'BLOCK') {
          shouldBlock = true
        } else if (rule.action === 'CHALLENGE') {
          shouldChallenge = true
        }
      }
    }
  }

  let action: 'ALLOW' | 'BLOCK' | 'CHALLENGE' = 'ALLOW'
  
  if (shouldBlock || riskScore >= 15) {
    action = 'BLOCK'
  } else if (shouldChallenge || riskScore >= 8) {
    action = 'CHALLENGE'
  }
  
  return {
    allowed: action === 'ALLOW',
    blocked: action === 'BLOCK',
    challenged: action === 'CHALLENGE',
    matchedRules,
    riskScore,
    action
  }
}

export async function validateRequest(request: NextRequest): Promise<{
  allowed: boolean
  wafResult: WAFResult
}> {
  const wafResult = analyzeRequest(request)

  if (wafResult.matchedRules.length > 0) {
    const { ip, userAgent } = extractRequestInfo(request)
    
    await logSecurityEvent({
      eventType: 'WAF_RULE_TRIGGERED',
      severity: getHighestSeverity(wafResult.matchedRules),
      description: `WAF rule triggered: ${wafResult.matchedRules.map(r => r.name).join(', ')}`,
      sourceIp: ip,
      userAgent,
      metadata: {
        matchedRules: wafResult.matchedRules.map(r => ({
          id: r.id,
          name: r.name,
          severity: r.severity,
          action: r.action
        })),
        riskScore: wafResult.riskScore,
        url: request.url,
        method: request.method
      }
    })
  }
  
  return {
    allowed: wafResult.allowed,
    wafResult
  }
}

function extractRequestInfo(request: NextRequest): {
  ip: string
  userAgent: string | null
} {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  const userAgent = request.headers.get('user-agent')
  
  return { ip, userAgent }
}

function getHighestSeverity(rules: WAFRule[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (rules.some(r => r.severity === 'CRITICAL')) return 'CRITICAL'
  if (rules.some(r => r.severity === 'HIGH')) return 'HIGH'
  if (rules.some(r => r.severity === 'MEDIUM')) return 'MEDIUM'
  return 'LOW'
}

export function generateBlockResponse(wafResult: WAFResult): Response {
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
        'X-WAF-Risk-Score': wafResult.riskScore.toString(),
        'X-WAF-Matched-Rules': wafResult.matchedRules.map(r => r.id).join(',')
      }
    }
  )
}

export function generateChallengeResponse(wafResult: WAFResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Additional verification required',
      code: 'WAF_CHALLENGE',
      timestamp: new Date().toISOString(),
      challenge: {
        type: 'captcha',
        required: true
      }
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-WAF-Action': 'CHALLENGE',
        'X-WAF-Risk-Score': wafResult.riskScore.toString(),
        'Retry-After': '60'
      }
    }
  )
}

export function validateInput(input: string): {
  valid: boolean
  sanitized: string
  warnings: string[]
} {
  const warnings: string[] = []
  let sanitized = input
  
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  if (sanitized !== input) {
    warnings.push('Potentially malicious content detected and sanitized')
  }

  if (input.length > 10000) {
    warnings.push('Input length exceeds maximum allowed')
    sanitized = sanitized.substring(0, 10000)
  }
  
  return {
    valid: warnings.length === 0,
    sanitized,
    warnings
  }
}

export function addWAFRule(rule: WAFRule): void {
  WAF_RULES.push(rule)
}

export function removeWAFRule(ruleId: string): boolean {
  const index = WAF_RULES.findIndex(rule => rule.id === ruleId)
  if (index !== -1) {
    WAF_RULES.splice(index, 1)
    return true
  }
  return false
}

export function getWAFRules(): WAFRule[] {
  return [...WAF_RULES]
}

export async function getWAFStats(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  
  const events = await prisma.securityEvent.findMany({
    where: {
      eventType: 'WAF_RULE_TRIGGERED',
      createdAt: { gte: since }
    }
  })
  
  const ruleStats: Record<string, number> = {}
  let totalBlocked = 0
  let totalChallenged = 0
  
  events.forEach(event => {
    const metadata = event.metadata as any
    if (metadata?.matchedRules) {
      metadata.matchedRules.forEach((rule: any) => {
        ruleStats[rule.id] = (ruleStats[rule.id] || 0) + 1
      })
    }
    
    if (metadata?.riskScore >= 15) {
      totalBlocked++
    } else if (metadata?.riskScore >= 8) {
      totalChallenged++
    }
  })
  
  return {
    totalEvents: events.length,
    totalBlocked,
    totalChallenged,
    ruleStats,
    topRules: Object.entries(ruleStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ruleId, count]) => ({
        ruleId,
        count,
        rule: WAF_RULES.find(r => r.id === ruleId)
      }))
  }
}



