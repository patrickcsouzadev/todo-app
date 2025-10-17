type AuthType = 'login' | 'register' | 'request-reset' | 'reset'
export function getAuthTitle(type: AuthType): string {
  switch (type) {
    case 'register':
      return 'Criar Conta'
    case 'login':
      return 'Entrar'
    case 'request-reset':
      return 'Recuperar Senha'
    case 'reset':
      return 'Redefinir Senha'
  }
}
export function getAuthButtonText(type: AuthType, loading: boolean): string {
  if (loading) return 'Carregando...'
  switch (type) {
    case 'register':
      return 'Criar Conta'
    case 'login':
      return 'Entrar'
    case 'request-reset':
      return 'Enviar Email'
    case 'reset':
      return 'Redefinir Senha'
  }
}