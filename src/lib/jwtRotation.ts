import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from './prisma'

export interface JWTPayload {
  userId: string
  email: string
  keyVersion?: string
}

export interface JWTKeyInfo {
  keyId: string
  secret: string
  algorithm: string
  isActive: boolean
  expiresAt: Date
}

export function generateJWTKey(): JWTKeyInfo {
  const keyId = crypto.randomUUID()
  const secret = crypto.randomBytes(64).toString('hex')
  const algorithm = 'HS256'
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  
  return {
    keyId,
    secret,
    algorithm,
    isActive: true,
    expiresAt
  }
}

export async function saveJWTKey(keyInfo: JWTKeyInfo): Promise<void> {
  await prisma.jWTKey.create({
    data: {
      keyId: keyInfo.keyId,
      secret: keyInfo.secret,
      algorithm: keyInfo.algorithm,
      isActive: keyInfo.isActive,
      expiresAt: keyInfo.expiresAt
    }
  })
}

export async function getCurrentJWTKey(): Promise<JWTKeyInfo | null> {
  const key = await prisma.jWTKey.findFirst({
    where: {
      isActive: true,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  if (!key) return null
  
  return {
    keyId: key.keyId,
    secret: key.secret,
    algorithm: key.algorithm,
    isActive: key.isActive,
    expiresAt: key.expiresAt
  }
}

export async function getJWTKeyById(keyId: string): Promise<JWTKeyInfo | null> {
  const key = await prisma.jWTKey.findUnique({
    where: { keyId }
  })
  
  if (!key) return null
  
  return {
    keyId: key.keyId,
    secret: key.secret,
    algorithm: key.algorithm,
    isActive: key.isActive,
    expiresAt: key.expiresAt
  }
}

export async function generateToken(payload: Omit<JWTPayload, 'keyVersion'>): Promise<string> {
  const currentKey = await getCurrentJWTKey()
  
  if (!currentKey) {
    throw new Error('No active JWT key found')
  }
  
  const tokenPayload: JWTPayload = {
    ...payload,
    keyVersion: currentKey.keyId
  }
  
  return jwt.sign(tokenPayload, currentKey.secret, {
    expiresIn: '30m',
    issuer: 'todo-app',
    audience: 'todo-app-users',
    algorithm: currentKey.algorithm,
    keyid: currentKey.keyId
  })
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.decode(token, { complete: true }) as any
    
    if (!decoded || !decoded.header || !decoded.header.kid) {
      return null
    }
    
    const keyId = decoded.header.kid
    const key = await getJWTKeyById(keyId)
    
    if (!key || !key.isActive) {
      return null
    }
    
    const payload = jwt.verify(token, key.secret, {
      issuer: 'todo-app',
      audience: 'todo-app-users',
      algorithms: [key.algorithm]
    }) as JWTPayload
    
    return payload
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT verification failed:', error)
    }
    return null
  }
}

export async function rotateJWTKey(): Promise<JWTKeyInfo> {
  await prisma.jWTKey.updateMany({
    where: {
      isActive: true
    },
    data: {
      isActive: false
    }
  })
  
  const newKey = generateJWTKey()
  await saveJWTKey(newKey)
  
  return newKey
}

export async function cleanupExpiredKeys(): Promise<number> {
  const result = await prisma.jWTKey.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
  
  return result.count
}

export async function listJWTKeys(): Promise<JWTKeyInfo[]> {
  const keys = await prisma.jWTKey.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  return keys.map(key => ({
    keyId: key.keyId,
    secret: key.secret,
    algorithm: key.algorithm,
    isActive: key.isActive,
    expiresAt: key.expiresAt
  }))
}

export async function initializeJWTKeys(): Promise<void> {
  const existingKeys = await prisma.jWTKey.count({
    where: {
      isActive: true,
      expiresAt: {
        gt: new Date()
      }
    }
  })
  
  if (existingKeys === 0) {
    const initialKey = generateJWTKey()
    await saveJWTKey(initialKey)
  }
}

export async function scheduledKeyRotation(): Promise<void> {
  const currentKey = await getCurrentJWTKey()
  
  if (!currentKey) {
    const newKey = generateJWTKey()
    await saveJWTKey(newKey)
    return
  }
  
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  if (currentKey.expiresAt < sevenDaysFromNow) {
    await rotateJWTKey()
    await cleanupExpiredKeys()
  }
}



