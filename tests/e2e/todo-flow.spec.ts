import { test, expect } from '@playwright/test'

test.describe('Todo App E2E Flow', () => {
  test('complete user flow: register, login, create todo', async ({ page }) => {
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'Test123!'

    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Todo App')

    await page.click('text=Criar Conta')
    await expect(page).toHaveURL('/auth/register')

    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Conta criada com sucesso')).toBeVisible()

    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'demo@ex.com')
    await page.fill('input[type="password"]', 'Senha123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Todo App')

    await expect(page.locator('text=Comprar material')).toBeVisible()

    await page.click('text=Nova Tarefa')
    await expect(page).toHaveURL('/todos/new')

    await page.fill('input[id="title"]', 'Test Todo from E2E')
    await page.fill('textarea[id="description"]', 'This is a test description')

    await page.click('input[value="RED"]')

    await page.selectOption('select[id="nameSelect"]', { index: 1 })

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')

    await expect(page.locator('text=Test Todo from E2E')).toBeVisible()

    await page.click('text=Urgente')
    await expect(page.locator('text=Test Todo from E2E')).toBeVisible()

    const todoCard = page.locator('text=Test Todo from E2E').locator('..')
    await todoCard.locator('input[type="checkbox"]').first().check()

    await page.waitForTimeout(500)

    await page.click('text=Sair')
    await expect(page).toHaveURL('/auth/login')
  })

  test('names management flow', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'demo@ex.com')
    await page.fill('input[type="password"]', 'Senha123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')

    await page.click('text=Gerenciar Pessoas')
    await expect(page).toHaveURL('/names')

    const newName = `Test Person ${Date.now()}`
    await page.fill('input[placeholder="Nome da pessoa"]', newName)
    await page.click('text=Adicionar')

    await expect(page.locator(`text=${newName}`)).toBeVisible()

    await page.locator(`text=${newName}`).locator('..').locator('button[title="Editar"]').click()
    await page.fill('input[aria-label="Editar nome"]', `${newName} Edited`)
    await page.click('text=Salvar')

    await expect(page.locator(`text=${newName} Edited`)).toBeVisible()
  })
})


