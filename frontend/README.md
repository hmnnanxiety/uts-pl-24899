# FrameVault

Your gear. Your archive. A private photography studio inventory workspace built with Vue 3, TypeScript, Vite, Vue Router, Axios, and maintainable CSS. No backend behavior is changed.

## Run locally

Requirements: Node 22.12+ or 24+, npm, the existing backend's PHP/Composer dependencies, and its configured database. Commands below use PowerShell from the repository root.

Terminal 1 — existing Laravel installation:

```powershell
cd backend
composer install
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

For a fresh backend checkout only: copy `.env.example` to `.env` if it does not already exist, configure the database, and run `php artisan key:generate` before migrating. Never regenerate an existing application's key or run `migrate:fresh` against an existing database. Use an existing staff account; the stock Laravel seeder does not create the demo account from the assignment.

Terminal 2 — Vue:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env # first setup only; do not overwrite an existing .env
npm run dev
```

Open [FrameVault locally](http://127.0.0.1:5173). The development proxy forwards `/api` to Laravel. Vite uses a fixed port to make local verification repeatable.

## API and future deployment

`VITE_API_BASE_URL=/api` is the browser-facing API prefix. `API_PROXY_TARGET=http://127.0.0.1:8000` is read only by the Vite development server; change it if Laravel uses another local port. Restart Vite after changing environment files.

Keep `/api` for the future Nginx runtime. Nginx must serve static files with SPA history fallback (`try_files $uri $uri/ /index.html`) and forward `/api` to the **HTTP-serving** Laravel service inside Compose. If the backend service only exposes PHP-FPM, configure FastCGI or a backend HTTP server instead of sending HTTP to PHP-FPM. The browser continues to request `/api` on the public frontend origin. Docker-only service names belong in Nginx configuration, never in browser-facing environment values. Preserve `/api` when forwarding requests. No Docker or deployment infrastructure is included.

Vite replaces `VITE_*` values at build time; changing a container environment after compilation does not rewrite the bundle. No secrets belong in these variables. A separately hosted API can be configured with an absolute URL, but must allow the frontend's origin and Authorization header through CORS. The default same-origin proxy needs no CORS change.

Contract used:

| Endpoint                         | Response used                               |
| -------------------------------- | ------------------------------------------- |
| `POST /login`                    | `token`, `user`                             |
| `GET /me`                        | `data` containing the user                  |
| `POST /logout`                   | revokes the current token                   |
| `GET /gear`                      | `data` containing the complete list         |
| `POST /gear`                     | `201`, `data` containing the created record |
| `GET /gear/:id`, `PUT /gear/:id` | `data` containing the record                |
| `DELETE /gear/:id`               | `200`                                       |

All paths are relative to the API prefix. The request interceptor adds Bearer authentication except on login. A protected `401` clears the current session and redirects to login; an incorrect login `401` stays on the form. Laravel `422` errors appear beside the corresponding fields. `404`, timeouts, server errors, and empty lists have recovery states. Blank optional fields become `null`, and purchase timestamps are converted to calendar dates for editing. The UI never submits `created_by`, IDs, or timestamps.

## Session storage decision

The token lives in `sessionStorage`, with a memory fallback if storage is blocked. Refreshes in the same tab restore the user with `/me`. Normal tab closure ends local persistence; it does **not** revoke a token on Laravel. A new independent tab normally requires login. With memory-only storage, refresh requires login again.

This is a practical university-demo trade-off: persistence is shorter than `localStorage`, but any JavaScript executing on the same origin can read the token. It is not protection against XSS. Vue escapes displayed data, no untrusted HTML is injected, assets are local, and tokens never appear in logs or UI. Production should use HTTPS, a suitable CSP, token expiry/revocation policies, and consider Sanctum's HttpOnly cookie-based SPA authentication if the backend contract is deliberately changed later.

Logout calls Laravel and always clears local state. If revocation fails because the server is unreachable, the login page clearly reports that the remote session may still exist. A transient `/me` network failure preserves the token and offers Retry rather than silently signing out.

## Design and architecture

- Dark editorial palette, local DM Sans fonts (SIL Open Font License distributed by `@fontsource/dm-sans`), Lucide icons, and original category-specific SVG illustrations. No remote image or font requests; no upload field.
- A small shared auth composable and toast composable avoid the need for a store dependency. Equipment lists are fetched per view to avoid retaining another user's inventory after logout.
- Reusable cards, field wrappers, status badges, loading/error panels, and create/edit form.
- Native modal dialog with explicit focus wrapping, Escape dismissal, initial focus on the safe action, and focus restoration.
- Search, category, status, sort, and page are encoded in query parameters. Twelve cards per page keep large lists usable; filtering still operates on the complete backend list. For substantially larger inventories, backend pagination/search should be a separate future API change.
- Dirty forms prompt before navigation, block navigation while saving, and guard browser refresh/close. Browser support controls whether its native unload warning appears.

```text
frontend/
├── public/favicon.svg
├── scripts/seed-demo.mjs
├── src/
│   ├── api/                  # Axios, token persistence, errors, auth and gear calls
│   ├── components/           # Brand/art, cards, fields, form, dialog, states, toasts
│   ├── composables/          # Auth, inventory, record loading, catalog, notifications
│   ├── layouts/AppLayout.vue
│   ├── lib/gear.ts           # Enum labels, dates and inventory statistics
│   ├── router/index.ts
│   ├── styles/               # Base, workspace, inventory and forms
│   ├── views/                # Login, dashboard, catalog, detail, editor, 404
│   ├── App.vue
│   ├── main.ts
│   └── types.ts
├── tests/                    # Real-API Playwright and accessibility checks
├── .env.example
├── .gitignore
├── .prettierrc.json
├── .prettierignore
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Demo inventory

The app never substitutes sample records for API data. This optional repeatable command adds eight clearly identified demo records **through Laravel**. It checks existing `FV-DEMO-*` codes and leaves them unchanged. It does not update or delete any records and refuses a non-local API URL. Credentials are read from process environment, not committed files.

With Laravel running, execute from `frontend`:

```powershell
$env:FRAMEVAULT_DEMO_EMAIL = Read-Host 'Staff email'
$demoSecret = Read-Host 'Staff password' -AsSecureString
$env:FRAMEVAULT_DEMO_PASSWORD = [Net.NetworkCredential]::new('', $demoSecret).Password
npm run demo:seed
Remove-Item Env:FRAMEVAULT_DEMO_EMAIL, Env:FRAMEVAULT_DEMO_PASSWORD
Remove-Variable demoSecret
```

Optional: set `FRAMEVAULT_API_URL` to another loopback API address. The script logs out its temporary token on completion. Demo records cover every category and all three availability states. They are labeled as demonstration data in their notes, and can be edited or removed normally.

## Verification

```powershell
npm run build
npm run format:check

# Both local servers must be running. Credentials stay in process environment.
$env:E2E_EMAIL = Read-Host 'Staff email'
$testSecret = Read-Host 'Staff password' -AsSecureString
$env:E2E_PASSWORD = [Net.NetworkCredential]::new('', $testSecret).Password
npm run test:e2e
Remove-Item Env:E2E_EMAIL, Env:E2E_PASSWORD
Remove-Variable testSecret
```

Playwright defaults to installed Microsoft Edge on this Windows workspace. To use installed Chrome, set `E2E_BROWSER=chrome`. To use Playwright Chromium elsewhere, install it with `npx playwright install chromium` and set `E2E_BROWSER=chromium`. `E2E_BASE_URL` can point to another local frontend port. Missing credentials cause integration tests to skip explicitly; skips are not passes.

Tests use the real API for login, CRUD, validation, statistics, search and filters. Network/server failure cases are explicitly simulated in the browser; token revocation is real. Tests create unique `QA-*` records and clean up only their own IDs, then revoke their token. Run against a local evaluation database, not production. An interrupted process can leave a QA record or token; inspect its code before removing it.

Screenshots, video, and trace recording are disabled. Layout assertions and axe checks run at 320, 390, 768, and 1440 CSS pixels. These checks supplement the final human visual review; they do not certify every accessibility scenario or browser.

`npm run build` includes strict TypeScript checking and creates `dist/`, which is ignored. `npm run preview` is a static build preview and does not provide the development API proxy; use the dev server for integrated evaluation or supply a reverse proxy separately.

## Verified result

Verification completed on 16 October 2026 on Windows with Microsoft Edge:

- Production build and strict TypeScript checks passed, including test sources.
- Prettier formatting checks passed.
- Nine browser scenarios passed: five desktop scenarios and four mobile scenarios, including real login/CRUD, database persistence after refresh, duplicate-code validation, search/filter/sort/pagination, catalog deletion failures, logout and revoked tokens.
- An additional login-route recovery fix was verified by rerunning both desktop and mobile resilience scenarios successfully.
- Axe WCAG A/AA checks and horizontal-overflow checks passed for login, dashboard, catalog, detail, create/edit forms and the delete dialog at applicable 320, 390, 768 and 1440px layouts. No browser JavaScript errors were observed in that pass.
- Existing Laravel tests passed: 16 tests, 58 assertions, using the backend's in-memory SQLite test configuration.
- Demo seeding created eight records through the API; a second run created zero and skipped all eight. Temporary QA records were cleaned up.

No backend source files were changed. Firefox/Safari, deployed Nginx/Compose behavior, and human visual/screen-reader review remain outside the automated verification performed here. No screenshots were captured.

## Final manual review

- Sign in with the existing staff account; try one incorrect password and the visibility toggle.
- Compare dashboard counts with the catalog. Refresh while signed in.
- Search by name, code, brand and model; combine category/availability filters and reset.
- Add a temporary item, provoke a duplicate-code error, edit it, refresh, then cancel and confirm deletion.
- Check a phone-sized viewport, keyboard navigation, and modal focus.
- In browser Network tools, verify `/api` requests and Bearer authentication without sharing the token.
- Sign out and try to reopen a protected route.
- Collect the final screenshots only when ready; none were captured during development.

Reference documentation: [Vite environment configuration](https://vite.dev/guide/env-and-mode), [Vue Router guards](https://router.vuejs.org/guide/advanced/navigation-guards.html), [Axios interceptors](https://axios-http.com/docs/interceptors).
