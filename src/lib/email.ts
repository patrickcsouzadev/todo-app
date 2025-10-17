import nodemailer from 'nodemailer'
import {
  wrapperStyle,
  headerGradientBlue,
  headerGradientRed,
  panelWhite,
  primaryButtonBlue,
  primaryButtonRed,
  codeBlockBlue,
  codeBlockRed,
  infoBoxGreen,
} from './emailStyles'
const smtpPort = parseInt(process.env.SMTP_PORT || '587')
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>
if ((process.env.SMTP_HOST || '').includes('gmail.com') || ((process.env.SMTP_SERVICE || '')).toLowerCase() === 'gmail') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    secure: smtpPort === 465,
    port: smtpPort,
  })
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}
transporter.verify()
  .then(() => {
    console.log('✅ SMTP transporter verified and ready to send messages')
  })
  .catch((err) => {
    console.warn('⚠️ SMTP transporter verification failed. Emails may not be sent.', err && (err as Error).message)
  })
export async function sendConfirmationEmail(email: string, token: string, userId?: string) {
  const base = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm`
  const confirmationUrl = userId
    ? `${base}?token=${token}&uid=${encodeURIComponent(userId)}`
    : `${base}?token=${token}`
  try {
    await transporter.sendMail({
      from: `"Todo App" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: '✅ Confirme seu email - Todo App',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de Email - Todo App</title>
        </head>
        <body style="${wrapperStyle}">
          <div style="${headerGradientBlue}">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Todo App</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sua central inteligente de tarefas</p>
          </div>
          <div style="${panelWhite}">
            <h2 style="color: #1e40af; margin-top: 0;">Bem-vindo ao Todo App! 🚀</h2>
            <p>Olá! Obrigado por se cadastrar no Todo App. Para ativar sua conta e começar a organizar suas tarefas, confirme seu endereço de email clicando no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" style="${primaryButtonBlue}">
                ✅ Confirmar Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="${codeBlockBlue}">${confirmationUrl}</p>
            <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
            <div style="${infoBoxGreen}">
              <h3 style="color: #059669; margin-top: 0;">🔐 Importante:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Este link expira em <strong>24 horas</strong></li>
                <li>Após confirmar, você poderá fazer login normalmente</li>
                <li>Se você não se cadastrou, pode ignorar este email</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">Se você tiver dúvidas, entre em contato conosco.</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 0;">
              Atenciosamente,<br>
              <strong>Equipe Todo App</strong>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Todo App. Todos os direitos reservados.</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </body>
        </html>
      `,
    })
    console.log('✅ Confirmation email sent successfully to:', email)
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error)
    throw error
  }
}
export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset?token=${token}`
  try {
    await transporter.sendMail({
      from: `"Todo App" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: '🔒 Redefinir senha - Todo App',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir Senha - Todo App</title>
        </head>
        <body style="${wrapperStyle}">
          <div style="${headerGradientRed}">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Todo App</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Redefinição de senha</p>
          </div>
          <div style="${panelWhite}">
            <h2 style="color: #dc2626; margin-top: 0;">Redefinir sua senha 🛡️</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no Todo App. Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="${primaryButtonRed}">
                🔑 Redefinir Senha
              </a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="${codeBlockRed}">${resetUrl}</p>
            <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
              <h3 style="color: #dc2626; margin-top: 0;">⚠️ Importante:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Este link expira em <strong>1 hora</strong> por segurança</li>
                <li>Após redefinir, você precisará fazer login novamente</li>
                <li>Se você <strong>NÃO</strong> solicitou esta alteração, ignore este email</li>
              </ul>
            </div>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0284c7; margin-top: 20px;">
              <h3 style="color: #0284c7; margin-top: 0;">💡 Dica de Segurança:</h3>
              <p style="margin: 10px 0;">Use uma senha forte com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.</p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">Se você tiver dúvidas sobre esta solicitação, entre em contato conosco imediatamente.</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 0;">
              Atenciosamente,<br>
              <strong>Equipe Todo App</strong>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Todo App. Todos os direitos reservados.</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </body>
        </html>
      `,
    })
    console.log('✅ Password reset email sent successfully to:', email)
  } catch (error) {
    console.error('❌ Failed to send reset password email:', error)
    throw error
  }
}