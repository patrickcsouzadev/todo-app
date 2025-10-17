import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken, generateAuthToken } from '@/lib/auth'
import { verifyMFACode } from '@/lib/mfa'
import { prisma } from '@/lib/prisma'
import { logAuditEvent, logSecurityEvent } from '@/lib/audit'
import { extractRequestInfo } from '@/lib/audit'
import { detectMFAAnomaly } from '@/lib/anomalyDetection'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código MFA é obrigatório' }, { status: 400 })
    }

    const token = request.cookies.get('__Host-auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (!user.totpSecret) {
      return NextResponse.json({ error: 'MFA não configurado' }, { status: 400 })
    }

    const mfaResult = verifyMFACode(user.totpSecret, code, user.backupCodes)
    
    const { ip, userAgent } = extractRequestInfo(request)
    
    const anomalyResult = await detectMFAAnomaly(user.id, ip, mfaResult.valid)
    
    if (anomalyResult.isAnomaly) {
      await logSecurityEvent({
        eventType: 'MFA_ANOMALY_DETECTED',
        severity: anomalyResult.severity,
        description: anomalyResult.description,
        sourceIp: ip,
        userAgent,
        userId: user.id,
        metadata: anomalyResult.metadata
      })
    }

    if (!mfaResult.valid) {
      await logAuditEvent({
        userId: user.id,
        action: 'USER_VERIFY_MFA',
        ip,
        userAgent,
        metadata: { 
          email: user.email,
          success: false,
          codeType: mfaResult.isBackupCode ? 'backup' : 'totp'
        }
      })

      return NextResponse.json({ error: 'Código MFA inválido' }, { status: 400 })
    }

    if (mfaResult.isBackupCode && mfaResult.updatedBackupCodes) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          backupCodes: mfaResult.updatedBackupCodes
        }
      })
    }

    if (!user.mfaEnabled) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: true
        }
      })
    }

    const newToken = await generateAuthToken({
      userId: user.id,
      email: user.email
    })

    await logAuditEvent({
      userId: user.id,
      action: 'USER_VERIFY_MFA',
      ip,
      userAgent,
      metadata: { 
        email: user.email,
        success: true,
        codeType: mfaResult.isBackupCode ? 'backup' : 'totp',
        mfaEnabled: true
      }
    })

    const response = NextResponse.json({
      success: true,
      message: mfaResult.isBackupCode ? 'Código de backup usado' : 'MFA verificado com sucesso'
    })

    response.cookies.set('__Host-auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60,
      path: '/'
    })

    return response

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('MFA verification error:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

