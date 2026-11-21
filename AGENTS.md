# Notes for coding agents

Read `README.md`, `docs/architecture.md` and `docs/local-development.md` first.

- `web/` is the dashboard (Vue 3 + TS + Vite). `services/` is the backend and `ai/` is
  the AI pipeline. `compose.yaml` runs everything.
- Use `npm run dev:preview` for UI work; it needs no backend. Verify UI changes in
  light and dark themes and at phone width.
- The campus deployment (`riset-01`, see `docs/local-development.md`) is a shared
  system. Do not restart, deploy to, or write to it unless the user asks for that
  specific action. Use `scripts/Invoke-Riset01.ps1` for read-only commands.
- Never print, commit or pass as arguments any password, token, credential file or
  `.env` file. Only `.env.example` files belong in git.
- Python services are copied into images whole (`COPY . .`) and started by their
  Dockerfile / `entrypoint.sh`. Trace those entrypoints before calling code unused.
- Commit or push only when the user asks.
