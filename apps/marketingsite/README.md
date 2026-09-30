# BesTal Marketing Site

Production React rebuild of the BesTal Solutions marketing website.

## Stack

- React + TypeScript
- Vite
- React Router
- CSS custom properties (original visual system)
- ESLint + Prettier

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

From the monorepo root:

```bash
npm run dev:marketingsite
npm run build:marketingsite
```

The app runs on port **5175** by default.

## Environment

Copy `.env.example` to `.env` if you need local overrides.

| Variable | Purpose |
| --- | --- |
| `VITE_APP_NAME` | Document / brand name |
| `VITE_SITE_URL` | Canonical site origin for SEO |
| `VITE_API_BASE_URL` | API origin used by the contact form. Defaults to `/api/v1` (Vite proxies that path to `http://localhost:3001` in development). |
| `VITE_APP_ORIGIN` | Product app origin. Client Workspace and Portal CTAs go here (`/login/client`, `/login/portal`). |
| `VITE_APP_ORIGIN_LOCAL` | Override used on localhost so CTAs hit the local web app (default `http://localhost:5174`). |

## Notes

- Client Workspace and Portal are external links into the product app (`app.bestal.co`). `/client-workspace` redirects there.
- Legal pages are drafts, matching the source HTML.
- Contact Us posts to `POST /api/v1/public/contact-messages`, the same public intake used by `apps/web`.
