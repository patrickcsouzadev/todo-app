import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'
import { 
  listJWTKeys, 
  rotateJWTKey, 
  cleanupExpiredKeys,
  initializeJWTKeys 
} from '@/lib/jwtRotation'
import { logAuditEvent } from '@/lib/audit'
import { extractRequestInfo } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('__Host-auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    
    const keys = await listJWTKeys()

    return NextResponse.json({
      success: true,
      keys: keys.map(key => ({
        keyId: key.keyId,
        algorithm: key.algorithm,
        isActive: key.isActive,
        createdAt: key.createdAt,
        expiresAt: key.expiresAt
      }))
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro na lista de chaves JWT:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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

    const { action } = await request.json()

    const { ip, userAgent } = extractRequestInfo(request)

    let result: any = {}

    switch (action) {
      case 'rotate':
        const newKey = await rotateJWTKey()
        result = {
          message: 'Chave JWT rotacionada com sucesso',
          newKeyId: newKey.keyId
        }
        
        await logAuditEvent({
          userId: payload.userId,
          action: 'JWT_KEY_ROTATION',
          ip,
          userAgent,
          metadata: { newKeyId: newKey.keyId }
        })
        break

      case 'cleanup':
        const deletedCount = await cleanupExpiredKeys()
        result = {
          message: 'Chaves expiradas removidas',
          deletedCount
        }
        
        await logAuditEvent({
          userId: payload.userId,
          action: 'JWT_KEY_CLEANUP',
          ip,
          userAgent,
          metadata: { deletedCount }
        })
        break

      case 'initialize':
        await initializeJWTKeys()
        result = {
          message: 'Chaves JWT inicializadas'
        }
        
        await logAuditEvent({
          userId: payload.userId,
          action: 'JWT_KEY_INITIALIZE',
          ip,
          userAgent,
          metadata: {}
        })
        break

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT keys action error:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}



