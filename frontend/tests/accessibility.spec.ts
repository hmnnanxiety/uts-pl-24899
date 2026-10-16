import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('accessible login and workspace layouts at desktop, tablet and mobile sizes', async ({
  page,
  request,
}) => {
  test.setTimeout(90000)
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD.')
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  async function checkLayout() {
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([])
  }
  await page.goto('/login')
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await checkLayout()
  }
  await page.getByLabel('Email address').fill(process.env.E2E_EMAIL!)
  await page.getByLabel('Password', { exact: true }).fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Enter the archive' }).click()
  await expect(page.getByRole('heading', { name: /Hello,/ })).toBeVisible()
  const token = await page.evaluate(() => sessionStorage.getItem('framevault.session'))
  const headers = { Authorization: `Bearer ${token}` }
  let id: number | undefined
  try {
    const result = await request.post('/api/gear', {
      headers,
      data: {
        code: `QA-A11Y-${Date.now()}`,
        name: 'Accessibility check camera',
        brand: 'QA',
        category: 'camera',
      },
    })
    expect(result.status()).toBe(201)
    id = (await result.json()).data.id
    for (const path of ['/', '/gear', `/gear/${id}`, '/gear/new', `/gear/${id}/edit`]) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 })
        await checkLayout()
      }
    }
    await page.goto(`/gear/${id}`)
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await checkLayout()
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeFocused()
    expect(errors).toEqual([])
  } finally {
    if (id) await request.delete(`/api/gear/${id}`, { headers })
    await request.post('/api/logout', { headers })
  }
})
