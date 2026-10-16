import { test, expect } from '@playwright/test'

test('create, validate duplicate code, edit, persist and delete equipment', async ({
  page,
  request,
}) => {
  test.skip(
    !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
    'Set local staff credentials in E2E_EMAIL and E2E_PASSWORD.',
  )
  const code = `QA-${Date.now()}`
  let id: string | undefined
  await page.goto('/login')
  await page.getByLabel('Email address').fill(process.env.E2E_EMAIL!)
  await page.getByLabel('Password', { exact: true }).fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Enter the archive' }).click()
  await expect(page.getByRole('heading', { name: /Hello,/ })).toBeVisible()
  const token = await page.evaluate(() => sessionStorage.getItem('framevault.session'))
  try {
    await page.getByRole('link', { name: 'Add equipment', exact: true }).click()
    await page.getByLabel('Inventory code').fill(code)
    await page.getByLabel('Equipment name').fill('QA studio camera')
    await page.getByRole('textbox', { name: 'Brand', exact: true }).fill('FrameVault QA')
    await page.getByLabel('Model', { exact: true }).fill('QA Model')
    await page.getByLabel('Storage location').fill('QA Shelf')
    await page.getByLabel('Purchase date').fill('2025-02-14')
    await page.getByLabel('Notes', { exact: true }).fill('Temporary automated verification record.')
    const created = page.waitForResponse(
      (r) => r.url().endsWith('/api/gear') && r.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Add to the archive' }).click()
    const response = await created
    expect(response.status()).toBe(201)
    id = String((await response.json()).data.id)
    await expect(page).toHaveURL(`/gear/${id}`)
    await expect(page.getByRole('heading', { name: 'QA studio camera', exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByText('QA Shelf', { exact: true })).toBeVisible()
    await expect(page.getByText('Feb 14, 2025', { exact: true })).toBeVisible()
    await page.goto('/gear/new')
    await page.getByLabel('Inventory code').fill(code)
    await page.getByLabel('Equipment name').fill('Duplicate')
    await page.getByRole('textbox', { name: 'Brand', exact: true }).fill('QA')
    await page.getByRole('button', { name: 'Add to the archive' }).click()
    await expect(page.getByLabel('Inventory code')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('#error-code')).toContainText('taken')
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('link', { name: 'Cancel', exact: true }).click()
    await page.goto(`/gear/${id}/edit`)
    await expect(page.getByLabel('Purchase date')).toHaveValue('2025-02-14')
    await page.getByLabel('Equipment name').fill('QA updated camera')
    await page.getByLabel('Availability').selectOption('maintenance')
    await page.getByLabel('Physical condition').selectOption('fair')
    await page.getByLabel('Model', { exact: true }).fill('')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page).toHaveURL(`/gear/${id}`)
    await expect(page.getByRole('heading', { name: 'QA updated camera' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'QA updated camera' })).toBeVisible()
    await expect(page.getByText('Maintenance', { exact: true })).toBeVisible()
    await expect(page.getByText('Fair', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Keep equipment' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('button', { name: 'Delete equipment', exact: true }).click()
    await expect(page).toHaveURL('/gear')
    await expect(page.getByText('QA updated camera', { exact: true })).not.toBeVisible()
    const removed = await request.get(`/api/gear/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(removed.status()).toBe(404)
  } finally {
    if (token) {
      if (id)
        await request.delete(`/api/gear/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      await request.post('/api/logout', { headers: { Authorization: `Bearer ${token}` } })
    }
  }
})
