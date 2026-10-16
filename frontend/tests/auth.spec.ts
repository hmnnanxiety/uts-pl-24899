import { test, expect } from '@playwright/test'

test('staff authentication, refresh, protected navigation and logout', async ({ page }) => {
  test.skip(
    !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
    'Set E2E_EMAIL and E2E_PASSWORD for your local staff account.',
  )
  await page.goto('/')
  await expect(page).toHaveURL(/login/)
  await page.getByLabel('Email address').fill(process.env.E2E_EMAIL!)
  await page.getByLabel('Password', { exact: true }).fill('intentionally-incorrect-test-value')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Hide password' }).click()
  await page.getByRole('button', { name: 'Enter the archive' }).click()
  await expect(page.getByRole('alert')).toContainText('don’t match')
  await page.getByLabel('Password', { exact: true }).fill(process.env.E2E_PASSWORD!)
  const login = page.waitForResponse(
    (response) => response.url().endsWith('/api/login') && response.status() === 200,
  )
  await page.getByRole('button', { name: 'Enter the archive' }).click()
  await login
  await expect(page.getByRole('heading', { name: /Hello,/ })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Equipment statistics' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: /Hello,/ })).toBeVisible()
  await page.goto('/login')
  await expect(page).toHaveURL('/')
  const logout = page.waitForResponse(
    (response) => response.url().endsWith('/api/logout') && response.status() === 200,
  )
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await logout
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible()
  await page.goto('/gear')
  await expect(page).toHaveURL(/login/)
})
