import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { generateToken, verifyToken } from './jwtRotation'
import { logAuditEvent, logLoginAttempt, logSecurityEvent } from './audit'
import { detectLoginAnomalies } from './anomalyDetection'
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET não configurado ou muito fraco (mínimo 32 caracteres)')
}
const JWT_EXPIRES_IN = '30m'
export interface JWTPayload {
  userId: string
  email: string
}
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
export async function generateAuthToken(payload: JWTPayload): Promise<string> {
  return generateToken(payload)
}
export async function verifyAuthToken(token: string): Promise<JWTPayload | null> {
  return verifyToken(token)
}
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('__Host-auth-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30 * 60,
    path: '/',
  })
}
export async function removeAuthCookie() {
  const cookieStore = await cookies()
  try {
    cookieStore.set('__Host-auth-token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
  } catch {
    try {
      cookieStore.delete('__Host-auth-token')
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to remove auth cookie:', e)
      }
    }
  }
}
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('__Host-auth-token')?.value
    if (!token) {
      return null
    }
    const payload = await verifyToken(token)
    if (!payload) {
      return null
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        isConfirmed: true,
        createdAt: true,
      },
    })
    return user
  } catch {
    return null
  }
}
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
export async function createConfirmationToken(userId: string): Promise<string> {
  await prisma.token.deleteMany({
    where: { userId, type: 'confirm' },
  })
  const token = generateRandomToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await prisma.token.create({
    data: {
      token,
      type: 'confirm',
      userId,
      expiresAt,
    },
  })
  return token
}
export async function createResetToken(userId: string): Promise<string> {
  await prisma.token.deleteMany({
    where: { userId, type: 'reset' },
  })
  const token = generateRandomToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  await prisma.token.create({
    data: {
      token,
      type: 'reset',
      userId,
      expiresAt,
    },
  })
  return token
}
export async function verifyAndConsumeToken(
  token: string,
  type: 'confirm' | 'reset'
) {
  const tokenRecord = await prisma.token.findFirst({
    where: {
      token,
      type,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  })
  if (!tokenRecord) {
    return null
  }
  try {
    await prisma.token.delete({ where: { id: tokenRecord.id } })
  } catch (err: any) {
    if (err?.code === 'P2025') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('verifyAndConsumeToken: token already deleted by concurrent request', tokenRecord.id)
      }
      const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } })
      return user || tokenRecord.user
    }
    throw err
  }
  return tokenRecord.user
}