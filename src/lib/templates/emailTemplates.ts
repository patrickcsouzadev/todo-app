import { confirmationEmailHTML, resetPasswordEmailHTML } from './emailHTML'
export const getConfirmationEmailTemplate = (email: string, token: string) => {
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?token=${token}`
  return {
    from: process.env.SMTP_FROM || 'noreply@todoapp.com',
    to: email,
    subject: '🎉 Confirme seu email - Todo App',
    html: confirmationEmailHTML(confirmUrl)
  }
}
export const getResetPasswordEmailTemplate = (email: string, token: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
  return {
    from: process.env.SMTP_FROM || 'noreply@todoapp.com',
    to: email,
    subject: '🔒 Redefinir senha - Todo App',
    html: resetPasswordEmailHTML(resetUrl)
  }
}



