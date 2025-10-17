import { prisma } from './prisma'

export interface SIEMEvent {
  id: string
  eventType: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  timestamp: Date
  sourceIp: string
  userId?: string
  description: string
  metadata: Record<string, any>
  resolved: boolean
}

export interface SIEMAlert {
  id: string
  title: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE'
  events: SIEMEvent[]
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  notes: string[]
}

export interface SIEMDashboard {
  totalEvents: number
  criticalEvents: number
  highEvents: number
  mediumEvents: number
  lowEvents: number
  openAlerts: number
  resolvedAlerts: number
  topSourceIPs: Array<{ ip: string; count: number }>
  topEventTypes: Array<{ eventType: string; count: number }>
  recentAlerts: SIEMAlert[]
}

export interface SIEMCorrelationRule {
  id: string
  name: string
  description: string
  conditions: CorrelationCondition[]
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  enabled: boolean
  actions: string[] 
}

export interface CorrelationCondition {
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
  value: any
  timeWindow?: number
}

export async function getSIEMDashboard(hours: number = 24): Promise<SIEMDashboard> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  
  const [
    totalEvents,
    criticalEvents,
    highEvents,
    mediumEvents,
    lowEvents,
    openAlerts,
    resolvedAlerts,
    topSourceIPs,
    topEventTypes,
    recentAlerts
  ] = await Promise.all([
    prisma.securityEvent.count({
      where: { createdAt: { gte: since } }
    }),
    
    prisma.securityEvent.count({
      where: { 
        createdAt: { gte: since },
        severity: 'CRITICAL'
      }
    }),
    prisma.securityEvent.count({
      where: { 
        createdAt: { gte: since },
        severity: 'HIGH'
      }
    }),
    prisma.securityEvent.count({
      where: { 
        createdAt: { gte: since },
        severity: 'MEDIUM'
      }
    }),
    prisma.securityEvent.count({
      where: { 
        createdAt: { gte: since },
        severity: 'LOW'
      }
    }),
    
    prisma.securityEvent.count({
      where: { 
        createdAt: { gte: since },
        resolved: false
      }
    }),
    prisma.securityEvent.count({
      where: { 
        createdAt: { gte: since },
        resolved: true
      }
    }),
    
    getTopSourceIPs(since),
    
    getTopEventTypes(since),
    
    getRecentAlerts(10)
  ])
  
  return {
    totalEvents,
    criticalEvents,
    highEvents,
    mediumEvents,
    lowEvents,
    openAlerts,
    resolvedAlerts,
    topSourceIPs,
    topEventTypes,
    recentAlerts
  }
}

async function getTopSourceIPs(since: Date): Promise<Array<{ ip: string; count: number }>> {
  const result = await prisma.securityEvent.groupBy({
    by: ['sourceIp'],
    where: { createdAt: { gte: since } },
    _count: { sourceIp: true },
    orderBy: { _count: { sourceIp: 'desc' } },
    take: 10
  })
  
  return result.map(item => ({
    ip: item.sourceIp,
    count: item._count.sourceIp
  }))
}

async function getTopEventTypes(since: Date): Promise<Array<{ eventType: string; count: number }>> {
  const result = await prisma.securityEvent.groupBy({
    by: ['eventType'],
    where: { createdAt: { gte: since } },
    _count: { eventType: true },
    orderBy: { _count: { eventType: 'desc' } },
    take: 10
  })
  
  return result.map(item => ({
    eventType: item.eventType,
    count: item._count.eventType
  }))
}

async function getRecentAlerts(limit: number): Promise<SIEMAlert[]> {
  const events = await prisma.securityEvent.findMany({
    where: { resolved: false },
    orderBy: { createdAt: 'desc' },
    take: limit * 10
  })
  
  const alerts: SIEMAlert[] = []
  const processedEventIds = new Set<string>()
  
  for (const event of events) {
    if (processedEventIds.has(event.id)) continue
    
    const relatedEvents = events.filter(e => 
      e.id !== event.id &&
      !processedEventIds.has(e.id) &&
      e.sourceIp === event.sourceIp &&
      Math.abs(e.createdAt.getTime() - event.createdAt.getTime()) < 30 * 60 * 1000
    )
    
    const alertEvents = [event, ...relatedEvents]
    alertEvents.forEach(e => processedEventIds.add(e.id))
    
    const alert: SIEMAlert = {
      id: `alert-${event.id}`,
      title: generateAlertTitle(alertEvents),
      description: generateAlertDescription(alertEvents),
      severity: getHighestSeverity(alertEvents.map(e => e.severity)),
      status: 'OPEN',
      events: alertEvents,
      createdAt: event.createdAt,
      updatedAt: new Date(),
      notes: []
    }
    
    alerts.push(alert)
  }
  
  return alerts.slice(0, limit)
}

function generateAlertTitle(events: any[]): string {
  const eventTypes = [...new Set(events.map(e => e.eventType))]
  
  if (eventTypes.length === 1) {
    return `${eventTypes[0]} detected`
  } else if (eventTypes.length <= 3) {
    return `Multiple security events: ${eventTypes.join(', ')}`
  } else {
    return `Multiple security events (${eventTypes.length} types)`
  }
}

function generateAlertDescription(events: any[]): string {
  const sourceIp = events[0].sourceIp
  const eventCount = events.length
  const timeSpan = Math.round((Math.max(...events.map(e => e.createdAt.getTime())) - 
                              Math.min(...events.map(e => e.createdAt.getTime()))) / 60000)
  
  return `${eventCount} security events detected from IP ${sourceIp} within ${timeSpan} minutes`
}

function getHighestSeverity(severities: string[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (severities.includes('CRITICAL')) return 'CRITICAL'
  if (severities.includes('HIGH')) return 'HIGH'
  if (severities.includes('MEDIUM')) return 'MEDIUM'
  return 'LOW'
}

export async function correlateEvents(): Promise<void> {
  const rules = getCorrelationRules()
  const since = new Date(Date.now() - 60 * 60 * 1000)
  
  for (const rule of rules) {
    if (!rule.enabled) continue
    
    const matchingEvents = await findEventsMatchingRule(rule, since)
    
    if (matchingEvents.length > 0) {
      await executeCorrelationActions(rule, matchingEvents)
    }
  }
}

function getCorrelationRules(): SIEMCorrelationRule[] {
  return [
    {
      id: 'brute_force_attack',
      name: 'Brute Force Attack Detection',
      description: 'Multiple failed login attempts from same IP',
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'FAILED_LOGIN_ATTEMPT'
        }
      ],
      severity: 'HIGH',
      enabled: true,
      actions: ['CREATE_ALERT', 'SEND_EMAIL']
    },
    {
      id: 'suspicious_activity_pattern',
      name: 'Suspicious Activity Pattern',
      description: 'Multiple suspicious activities from same IP',
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'SUSPICIOUS_ACTIVITY'
        }
      ],
      severity: 'MEDIUM',
      enabled: true,
      actions: ['CREATE_ALERT']
    },
    {
      id: 'rate_limit_abuse',
      name: 'Rate Limit Abuse',
      description: 'Multiple rate limit violations',
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'RATE_LIMIT_EXCEEDED'
        }
      ],
      severity: 'MEDIUM',
      enabled: true,
      actions: ['CREATE_ALERT', 'BLOCK_IP']
    },
    {
      id: 'privilege_escalation',
      name: 'Privilege Escalation Attempt',
      description: 'Multiple unauthorized access attempts',
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'UNAUTHORIZED_ACCESS'
        }
      ],
      severity: 'CRITICAL',
      enabled: true,
      actions: ['CREATE_ALERT', 'SEND_EMAIL', 'BLOCK_IP']
    }
  ]
}

async function findEventsMatchingRule(
  rule: SIEMCorrelationRule,
  since: Date
): Promise<any[]> {
  const timeWindow = new Date(Date.now() - 15 * 60 * 1000)
  
  const whereClause: any = {
    createdAt: { gte: timeWindow },
    resolved: false
  }
  
  for (const condition of rule.conditions) {
    switch (condition.operator) {
      case 'equals':
        whereClause[condition.field] = condition.value
        break
      case 'contains':
        whereClause[condition.field] = {
          contains: condition.value
        }
        break
    }
  }
  
  const events = await prisma.securityEvent.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  })
  
  const eventsByIP = new Map<string, any[]>()
  
  for (const event of events) {
    const ip = event.sourceIp
    if (!eventsByIP.has(ip)) {
      eventsByIP.set(ip, [])
    }
    eventsByIP.get(ip)!.push(event)
  }
  
  const matchingEvents: any[] = []
  
  for (const [ip, ipEvents] of eventsByIP) {
    if (ipEvents.length >= 3) {
      matchingEvents.push(...ipEvents)
    }
  }
  
  return matchingEvents
}

async function executeCorrelationActions(
  rule: SIEMCorrelationRule,
  events: any[]
): Promise<void> {
  for (const action of rule.actions) {
    switch (action) {
      case 'CREATE_ALERT':
        await createCorrelationAlert(rule, events)
        break
      case 'SEND_EMAIL':
        await sendSecurityAlertEmail(rule, events)
        break
      case 'BLOCK_IP':
        await blockSourceIPs(events)
        break
    }
  }
}

async function createCorrelationAlert(
  rule: SIEMCorrelationRule,
  events: any[]
): Promise<void> {
  const sourceIPs = [...new Set(events.map(e => e.sourceIp))]
  const eventTypes = [...new Set(events.map(e => e.eventType))]
  
  await prisma.securityEvent.create({
    data: {
      eventType: 'CORRELATION_ALERT',
      severity: rule.severity,
      description: `Correlation rule triggered: ${rule.name}. Events: ${eventTypes.join(', ')} from IPs: ${sourceIPs.join(', ')}`,
      sourceIp: sourceIPs[0],
      metadata: {
        ruleId: rule.id,
        ruleName: rule.name,
        sourceIPs,
        eventTypes,
        eventCount: events.length,
        events: events.map(e => ({
          id: e.id,
          eventType: e.eventType,
          severity: e.severity,
          timestamp: e.createdAt
        }))
      },
      resolved: false
    }
  })
}

async function sendSecurityAlertEmail(
  rule: SIEMCorrelationRule,
  events: any[]
): Promise<void> {

  if (process.env.NODE_ENV === 'development') {
    console.log(`Security Alert Email: ${rule.name}`, {
      ruleId: rule.id,
      severity: rule.severity,
      eventCount: events.length,
      sourceIPs: [...new Set(events.map(e => e.sourceIp))]
    })
  }
}

async function blockSourceIPs(events: any[]): Promise<void> {
  const sourceIPs = [...new Set(events.map(e => e.sourceIp))]
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Blocking IPs: ${sourceIPs.join(', ')}`)
  }
}

export async function getSecurityStats(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  
  const [
    totalEvents,
    eventsBySeverity,
    eventsByType,
    resolvedEvents,
    correlationAlerts
  ] = await Promise.all([
    prisma.securityEvent.count({
      where: { createdAt: { gte: since } }
    }),
    
    prisma.securityEvent.groupBy({
      by: ['severity'],
      where: { createdAt: { gte: since } },
      _count: { severity: true }
    }),
    
    prisma.securityEvent.groupBy({
      by: ['eventType'],
      where: { createdAt: { gte: since } },
      _count: { eventType: true },
      orderBy: { _count: { eventType: 'desc' } },
      take: 10
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
        eventType: 'CORRELATION_ALERT'
      }
    })
  ])
  
  return {
    totalEvents,
    eventsBySeverity: eventsBySeverity.reduce((acc, item) => {
      acc[item.severity] = item._count.severity
      return acc
    }, {} as Record<string, number>),
    eventsByType: eventsByType.map(item => ({
      eventType: item.eventType,
      count: item._count.eventType
    })),
    resolvedEvents,
    correlationAlerts,
    resolutionRate: totalEvents > 0 ? (resolvedEvents / totalEvents) * 100 : 0
  }
}

export async function resolveSecurityEvents(eventIds: string[]): Promise<void> {
  await prisma.securityEvent.updateMany({
    where: {
      id: { in: eventIds }
    },
    data: {
      resolved: true
    }
  })
}

export async function getSecurityEvents(filters: {
  severity?: string
  eventType?: string
  sourceIp?: string
  resolved?: boolean
  limit?: number
  offset?: number
}) {
  const where: any = {}
  
  if (filters.severity) where.severity = filters.severity
  if (filters.eventType) where.eventType = filters.eventType
  if (filters.sourceIp) where.sourceIp = filters.sourceIp
  if (filters.resolved !== undefined) where.resolved = filters.resolved
  
  const events = await prisma.securityEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filters.limit || 50,
    skip: filters.offset || 0
  })
  
  const total = await prisma.securityEvent.count({ where })
  
  return {
    events,
    total,
    hasMore: (filters.offset || 0) + events.length < total
  }
}

export async function analyzeSecurityTrends(days: number = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  const dailyEvents = await prisma.securityEvent.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: since } },
    _count: { createdAt: true },
    orderBy: { createdAt: 'asc' }
  })
  
  const trends = {
    dailyEventCounts: dailyEvents.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.createdAt
    })),
    averageEventsPerDay: dailyEvents.length > 0 ? 
      dailyEvents.reduce((sum, item) => sum + item._count.createdAt, 0) / dailyEvents.length : 0,
    peakDay: dailyEvents.reduce((peak, current) => 
      current._count.createdAt > peak._count.createdAt ? current : peak, 
      dailyEvents[0] || { createdAt: new Date(), _count: { createdAt: 0 } }
    )
  }
  
  return trends
}
