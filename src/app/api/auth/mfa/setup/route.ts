import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'
import { setupMFA, generateQRCodeBase64 } from '@/lib/mfa'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit'
import { extractRequestInfo } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
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

    if (user.mfaEnabled) {
      return NextResponse.json({ error: 'MFA já está habilitado' }, { status: 400 })
    }

    const mfaSetup = setupMFA(user.email)
    
    const qrCodeBase64 = await generateQRCodeBase64(mfaSetup.secret, user.email)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: mfaSetup.secret,
        backupCodes: mfaSetup.backupCodes
      }
    })

    const { ip, userAgent } = extractRequestInfo(request)
    await logAuditEvent({
      userId: user.id,
      action: 'USER_SETUP_MFA',
      ip,
      userAgent,
      metadata: { email: user.email }
    })

    return NextResponse.json({
      success: true,
      secret: mfaSetup.secret,
      qrCode: qrCodeBase64,
      backupCodes: mfaSetup.backupCodes
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Erro na configuração do MFA:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

