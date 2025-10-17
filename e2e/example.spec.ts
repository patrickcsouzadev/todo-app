import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Todo App/);
});

test('register page is accessible', async ({ page }) => {
  await page.goto('/auth/register');
  await expect(page.getByRole('heading', { name: /registrar/i })).toBeVisible();
});

test('login page is accessible', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
});