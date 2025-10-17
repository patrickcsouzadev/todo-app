import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'
import { verifyMFACode } from '@/lib/mfa'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit'
import { extractRequestInfo } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const { code, password } = await request.json()
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código MFA é obrigatório' }, { status: 400 })
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 })
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

    if (!user.mfaEnabled) {
      return NextResponse.json({ error: 'MFA não está habilitado' }, { status: 400 })
    }

    const bcrypt = await import('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 400 })
    }

    const mfaResult = verifyMFACode(user.totpSecret!, code, user.backupCodes)
    
    if (!mfaResult.valid) {
      const { ip, userAgent } = extractRequestInfo(request)
      
      await logAuditEvent({
        userId: user.id,
        action: 'USER_DISABLE_MFA',
        ip,
        userAgent,
        metadata: { 
          email: user.email,
          success: false,
          reason: 'Invalid MFA code'
        }
      })

      return NextResponse.json({ error: 'Código MFA inválido' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        totpSecret: null,
        backupCodes: []
      }
    })

    const { ip, userAgent } = extractRequestInfo(request)
    
    await logAuditEvent({
      userId: user.id,
      action: 'USER_DISABLE_MFA',
      ip,
      userAgent,
      metadata: { 
        email: user.email,
        success: true,
        codeType: mfaResult.isBackupCode ? 'backup' : 'totp'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'MFA desabilitado com sucesso'
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('MFA disable error:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

