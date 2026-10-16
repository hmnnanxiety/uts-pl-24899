// Demo fixtures are persisted through the existing API, never injected into the UI.
// Existing codes are skipped; this command never updates or deletes inventory.
const base = (process.env.FRAMEVAULT_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')
const email = process.env.FRAMEVAULT_DEMO_EMAIL
const password = process.env.FRAMEVAULT_DEMO_PASSWORD
if (!email || !password) {
  console.error(
    'Set FRAMEVAULT_DEMO_EMAIL and FRAMEVAULT_DEMO_PASSWORD for your local staff account.',
  )
  process.exit(1)
}
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname)) {
  console.error('Demo seeding is restricted to a local API to avoid changing a deployed inventory.')
  process.exit(1)
}
const records = [
  [
    'CAM-01',
    'Alpha 7 IV',
    'Sony',
    'ILCE-7M4',
    'camera',
    'excellent',
    'available',
    'Cabinet A · Shelf 01',
  ],
  ['CAM-02', 'EOS R6', 'Canon', 'R6', 'camera', 'good', 'in_use', 'Studio B · Camera station'],
  [
    'LEN-01',
    'The everyday zoom',
    'Sony',
    'FE 24–70mm GM',
    'lens',
    'excellent',
    'available',
    'Cabinet A · Lens drawer',
  ],
  [
    'LEN-02',
    'Portrait prime',
    'Sigma',
    '85mm Art',
    'lens',
    'good',
    'available',
    'Cabinet A · Lens drawer',
  ],
  [
    'LGT-01',
    'Studio key light',
    'Godox',
    'SL60W',
    'lighting',
    'fair',
    'maintenance',
    'Service bench',
  ],
  [
    'LGT-02',
    'Portable flash',
    'Godox',
    'AD200 Pro',
    'lighting',
    'good',
    'in_use',
    'Studio B · Lighting cart',
  ],
  [
    'TRI-01',
    'Studio tripod',
    'Manfrotto',
    '190',
    'tripod',
    'good',
    'available',
    'Equipment wall · Bay 03',
  ],
  [
    'ACC-01',
    'Field audio kit',
    'RØDE',
    'Wireless GO II',
    'accessory',
    'excellent',
    'available',
    'Cabinet C · Audio case',
  ],
]
let token
async function call(path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, {
    method,
    signal: AbortSignal.timeout(15000),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!response.ok)
    throw new Error(
      `${method} ${path} failed (HTTP ${response.status}). Check your local API and staff account.`,
    )
  return response.json()
}
try {
  token = (await call('/login', 'POST', { email, password })).token
  const existing = new Set((await call('/gear')).data.map((item) => item.code))
  let created = 0,
    skipped = 0
  for (const [
    suffix,
    name,
    brand,
    model,
    category,
    condition,
    status,
    storage_location,
  ] of records) {
    const code = `FV-DEMO-${suffix}`
    if (existing.has(code)) {
      skipped++
      continue
    }
    await call('/gear', 'POST', {
      code,
      name,
      brand,
      model,
      category,
      condition,
      status,
      storage_location,
      purchase_date: '2025-06-12',
      notes:
        'Demo inventory for university evaluation. Replace this record with your studio’s actual equipment details before operational use.',
    })
    created++
  }
  console.log(
    `Demo inventory ready: ${created} created, ${skipped} existing records left unchanged.`,
  )
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Demo inventory setup failed.')
  process.exitCode = 1
} finally {
  if (token) {
    try {
      await call('/logout', 'POST')
    } catch {
      console.error('Could not revoke the demo setup session. Ask your administrator to revoke it.')
      process.exitCode = 1
    }
  }
}
