import { test, expect } from '@playwright/test'

test('server errors, session restoration recovery, 404 and revoked tokens', async ({
  page,
  request,
}) => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD.')
  await page.goto('/login')
  await page.getByLabel('Email address').fill(process.env.E2E_EMAIL!)
  await page.getByLabel('Password', { exact: true }).fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Enter the archive' }).click()
  await expect(page.getByRole('heading', { name: /Hello,/ })).toBeVisible()
  const token = await page.evaluate(() => sessionStorage.getItem('framevault.session'))
  const headers = { Authorization: `Bearer ${token}` }
  try {
    await page.route('**/api/gear', (route) =>
      route.fulfill({ status: 503, json: { message: 'Test server error' } }),
    )
    await page.goto('/gear')
    await expect(page.getByRole('alert')).toContainText('try again')
    await page.unroute('**/api/gear')
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('button', { name: 'Refresh inventory' })).toBeVisible()
    await page.route('**/api/me', (route) => route.abort('failed'))
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Your archive is waiting.' })).toBeVisible()
    expect(await page.evaluate(() => !!sessionStorage.getItem('framevault.session'))).toBe(true)
    await page.unroute('**/api/me')
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('heading', { name: 'The equipment archive.' })).toBeVisible()
    await page.route('**/api/me', (route) => route.abort('failed'))
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Your archive is waiting.' })).toBeVisible()
    await page.unroute('**/api/me')
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /Hello,/ })).toBeVisible()
    await page.goto('/gear/999999999')
    await expect(page.getByRole('heading', { name: 'This piece is out of frame.' })).toBeVisible()
    await page.getByRole('link', { name: 'Browse equipment' }).click()
    await expect(page.getByRole('button', { name: 'Refresh inventory' })).toBeVisible()
    const revoked = await request.post('/api/logout', { headers })
    expect(revoked.status()).toBe(200)
    await page.getByRole('button', { name: 'Refresh inventory' }).click()
    await expect(page).toHaveURL(/login/)
    await expect(page.getByRole('status')).toContainText('session has ended')
    expect(await page.evaluate(() => sessionStorage.getItem('framevault.session'))).toBeNull()
  } finally {
    await request.post('/api/logout', { headers })
  }
})
