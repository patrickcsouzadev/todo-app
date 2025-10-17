export const confirmationEmailHTML = (confirmUrl: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu Email</title>
  <link rel="stylesheet" href="email.css">
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <span class="header-icon">📝</span>
      <h1>Bem-vindo ao Todo App!</h1>
    </div>
    <div class="content">
      <p class="welcome-text">Olá! 👋</p>
      <p class="message">
        Ficamos muito felizes em ter você conosco! Você está a um passo de começar a organizar suas tarefas de forma simples e eficiente.
      </p>
      <p class="message">
        Para ativar sua conta e começar a usar todos os recursos do Todo App, por favor confirme seu endereço de email clicando no botão abaixo:
      </p>
      <div class="button-container">
        <a href="${confirmUrl}" class="button">
          ✓ Confirmar Meu Email
        </a>
      </div>
      <div class="features">
        <h3>🌟 O que você pode fazer:</h3>
        <div class="feature-item">
          <span class="feature-icon">👥</span>
          <p class="feature-text">Atribua tarefas para diferentes pessoas</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔗</span>
          <p class="feature-text">Adicione links com preview automático</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">⚡</span>
          <p class="feature-text">Organize por prioridade (Urgente, Importante, Pode Esperar)</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔍</span>
          <p class="feature-text">Filtre e busque suas tarefas facilmente</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📱</span>
          <p class="feature-text">Interface responsiva para qualquer dispositivo</p>
        </div>
      </div>
      <div class="security-notice">
        <h4>🔒 Segurança</h4>
        <p>Este link expira em 24 horas. Se você não solicitou esta conta, pode ignorar este email.</p>
      </div>
    </div>
    <div class="footer">
      <p>Este email foi enviado automaticamente. Não responda a esta mensagem.</p>
      <p>Todo App - Organize sua vida com simplicidade</p>
      <div class="footer-links">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login">Login</a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password">Esqueci minha senha</a>
      </div>
    </div>
  </div>
</body>
</html>
`
export const resetPasswordEmailHTML = (resetUrl: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha</title>
  <link rel="stylesheet" href="email.css">
</head>
<body>
  <div class="email-wrapper">
    <div class="header reset-header">
      <span class="header-icon">🔒</span>
      <h1>Redefinir sua senha</h1>
    </div>
    <div class="content">
      <p class="welcome-text">Olá! 👋</p>
      <p class="message">
        Recebemos uma solicitação para redefinir a senha da sua conta no Todo App.
      </p>
      <p class="message">
        Se foi você quem solicitou, clique no botão abaixo para criar uma nova senha segura:
      </p>
      <div class="button-container">
        <a href="${resetUrl}" class="button reset-button">
          🔑 Redefinir Senha
        </a>
      </div>
      <div class="features">
        <h3>🛡️ Dicas de segurança:</h3>
        <div class="feature-item">
          <span class="feature-icon reset-feature-icon">🔐</span>
          <p class="feature-text">Use senhas com pelo menos 8 caracteres</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon reset-feature-icon">🔢</span>
          <p class="feature-text">Combine letras, números e símbolos</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon reset-feature-icon">🚫</span>
          <p class="feature-text">Evite informações pessoais óbvias</p>
        </div>
        <div class="feature-item">
          <span class="feature-icon reset-feature-icon">🔄</span>
          <p class="feature-text">Altere suas senhas regularmente</p>
        </div>
      </div>
      <div class="security-notice">
        <h4>⚠️ Importante</h4>
        <p>Este link expira em 1 hora por segurança. Se você não solicitou a redefinição, ignore este email.</p>
      </div>
    </div>
    <div class="footer">
      <p>Este email foi enviado automaticamente. Não responda a esta mensagem.</p>
      <p>Todo App - Organize sua vida com simplicidade</p>
      <div class="footer-links">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login">Login</a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password">Esqueci minha senha</a>
      </div>
    </div>
  </div>
</body>
</html>
`



