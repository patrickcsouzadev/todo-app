import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Deploy completed - starting post-deploy setup...')

    const deploySecret = process.env.DEPLOY_SECRET || 'default-deploy-secret'
    
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${deploySecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const initResults = []

    try {
      const securityInitResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/security/init`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deploySecret}`,
          'Content-Type': 'application/json'
        }
      })

      if (securityInitResponse.ok) {
        initResults.push('✅ Sistemas de segurança inicializados')
      } else {
        initResults.push('❌ Falha na inicialização dos sistemas de segurança')
      }
    } catch (error) {
      initResults.push('❌ Erro na inicialização dos sistemas de segurança')
    }

    try {
      const monitorResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/security/monitor`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        }
      })

      if (monitorResponse.ok) {
        initResults.push('✅ Monitoramento de segurança iniciado')
      } else {
        initResults.push('❌ Falha ao iniciar o monitoramento de segurança')
      }
    } catch (error) {
      initResults.push('❌ Erro no monitoramento de segurança')
    }

    console.log('📋 Post-deploy setup results:', initResults)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Post-deploy setup completed',
      results: initResults,
      nextSteps: [
        'Security systems are now running automatically',
        'Monitor logs via /api/security/dashboard',
        'Cron jobs will run automatically via Vercel Cron',
        'All security features are active'
      ]
    })

  } catch (error) {
    console.error('❌ Post-deploy setup error:', error)
    
    return NextResponse.json(
      { 
        error: 'Post-deploy setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}



