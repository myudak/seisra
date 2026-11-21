# Seisra web

Vue 3 + TypeScript + Vite dashboard. Tailwind with DaisyUI themes `seisra` (light) and `seisra-dark`.

```bash
npm ci
npm run dev:preview   # fixture data, no backend          http://127.0.0.1:5174
npm run dev:local     # proxy to `docker compose up`       http://127.0.0.1:5173
npm run build         # production bundle in dist/
```

- `src/domain/<page>/`: one folder per screen (home, eq-view, station-view, trace-view,
  origin-locator-view, picking, config-view, auth).
- `src/components/`: shared UI, such as the side panel, page header, empty state, maps and date filter.
- `src/preview/`: fixture data and fake sockets for `dev:preview`. Production builds exclude it.
- `src/constants/env.ts`: backend URLs. Unset means same origin, which is what the
  nginx in `Dockerfile` and the Vite proxies provide.
