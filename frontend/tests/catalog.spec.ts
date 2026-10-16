import { test, expect } from '@playwright/test'

test('real inventory search, combined filters, pagination and catalog deletion', async ({
  page,
  request,
}) => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD.')
  const prefix = `QA-${Date.now()}`
  const ids: number[] = []
  await page.goto('/login')
  await page.getByLabel('Email address').fill(process.env.E2E_EMAIL!)
  await page.getByLabel('Password', { exact: true }).fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Enter the archive' }).click()
  await expect(page.getByRole('heading', { name: /Hello,/ })).toBeVisible()
  const token = await page.evaluate(() => sessionStorage.getItem('framevault.session'))
  const headers = { Authorization: `Bearer ${token}` }
  try {
    for (let index = 0; index < 13; index++) {
      const result = await request.post('/api/gear', {
        headers,
        data: {
          code: `${prefix}-${index}`,
          name: `${prefix} Piece ${String(index).padStart(2, '0')}`,
          brand: 'QA Search Brand',
          model: 'QA Search Model',
          category: ['camera', 'lens', 'lighting', 'tripod', 'accessory'][index % 5],
          status: ['available', 'in_use', 'maintenance'][index % 3],
        },
      })
      expect(result.status()).toBe(201)
      ids.push((await result.json()).data.id)
    }
    const inventory = (await (await request.get('/api/gear', { headers })).json()).data as {
      status: string
    }[]
    await page.goto('/')
    await expect(page.locator('.metric.total strong')).toHaveText(String(inventory.length))
    for (const state of ['available', 'in_use', 'maintenance']) {
      await expect(page.locator(`.metric.${state} strong`)).toHaveText(
        String(inventory.filter((item) => item.status === state).length),
      )
    }
    await page.goto(`/gear?q=${prefix}`)
    await expect(page.locator('.gear-card')).toHaveCount(12)
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(page.locator('.gear-card')).toHaveCount(1)
    await page.getByRole('button', { name: 'Previous', exact: true }).click()
    await page.getByRole('button', { name: 'Cameras', exact: true }).click()
    await expect(page.locator('.gear-card')).toHaveCount(3)
    await page.getByLabel('Filter by availability').selectOption('available')
    await expect(page.locator('.gear-card')).toHaveCount(1)
    await page.reload()
    await expect(page.locator('.gear-card')).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Cameras', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await page.getByRole('button', { name: 'Reset filters' }).click()
    await page.getByLabel('Search equipment').fill('QA Search Model')
    await expect(page.locator('.gear-card')).toHaveCount(12)
    await page.getByLabel('Search equipment').fill('QA Search Brand')
    await expect(page.locator('.gear-card')).toHaveCount(12)
    await page.getByLabel('Search equipment').fill(`${prefix}-0`)
    await expect(page.locator('.gear-card')).toHaveCount(1)
    await page.getByLabel('Search equipment').fill('no-match-at-all-qa')
    await expect(page.getByRole('heading', { name: 'Nothing in this frame.' })).toBeVisible()
    await page.getByRole('button', { name: 'Clear all filters' }).click()
    await page.getByLabel('Search equipment').fill(prefix)
    await page.getByLabel('Sort equipment').selectOption('name')
    await expect(page.locator('.gear-card h3').first()).toContainText('Piece 00')
    await page
      .locator('.gear-card')
      .first()
      .getByRole('button', { name: /^Delete / })
      .click()
    await page.getByRole('button', { name: 'Keep equipment' }).click()
    await expect(page.locator('.gear-card')).toHaveCount(12)
    await page.route('**/api/gear/*', async (route) => {
      if (route.request().method() === 'DELETE')
        await route.fulfill({ status: 503, json: { message: 'Test failure' } })
      else await route.continue()
    })
    await page
      .locator('.gear-card')
      .first()
      .getByRole('button', { name: /^Delete / })
      .click()
    await page.getByRole('button', { name: 'Delete equipment', exact: true }).click()
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText('try again')
    await page.unroute('**/api/gear/*')
    await page.getByRole('button', { name: 'Delete equipment', exact: true }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.locator('.gear-card')).toHaveCount(12)
    await expect(page.locator('.gear-card h3').first()).toContainText('Piece 01')
    await expect(page.getByRole('navigation', { name: 'Equipment pages' })).not.toBeVisible()
  } finally {
    for (const id of ids) await request.delete(`/api/gear/${id}`, { headers })
    await request.post('/api/logout', { headers })
  }
})
