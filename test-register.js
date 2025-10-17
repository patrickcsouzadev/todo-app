// Teste de cadastro local
async function testRegister() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Teste Usuario',
        email: 'teste@example.com',
        password: 'SenhaForte!@#456'
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Cadastro bem-sucedido:', data)
    } else {
      console.log('❌ Erro no cadastro:', response.status, data)
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message)
  }
}

testRegister()
