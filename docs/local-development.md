# Local development

Three ways to run the UI, from lightest to heaviest.

## 1. Preview: no backend

```bash
cd web && npm ci && npm run dev:preview     # http://127.0.0.1:5174
```

Fixture data and fake sockets, all inside the browser. Login with any name.
`npm run serve:preview` builds a bundle instead of the dev server. Use it for
slow devices or a tunnel, because the dev server loads hundreds of modules.
Production builds contain none of the preview code.

## 2. Local stack

```bash
cp .env.example .env
docker compose up -d                  # infra + backend + web, no AI
cd web && npm run dev:local           # http://127.0.0.1:5173, hot reload
```

`dev:local` proxies `/api`, `/record-api`, `/socket.io` and `/ws*` to the stack's web
container on port 8080. Set `SEISRA_STACK_URL` to point it at another stack.

## 3. Campus backend over SSH (Windows)

The UI runs locally and the existing campus deployment is reached through SSH forwards.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Start-LocalUI.ps1   # http://127.0.0.1:5173
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Stop-LocalUI.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Invoke-Riset01.ps1 -Command 'docker ps'
```

| Browser path | Local forward | Campus service |
| --- | --- | --- |
| `/api/v1` | `127.0.0.1:43803` | controller API, 38003 |
| `/record-api/api/v1` | `127.0.0.1:43801` | record API, 38001 |
| `/socket.io` | `127.0.0.1:43804` | waveform Socket.IO, 38004 |
| `/wsevent`, `/wspicking`, `/wsarrivalpick` | `127.0.0.1:43805` | general WebSocket, 38005 |

- The SSH credential lives outside the repository in
  `%USERPROFILE%\.ssh\riset-01.credential.xml`. It is DPAPI-encrypted for this Windows
  user only. The helpers decrypt it in-process and never print it or pass it as an
  argument. Unknown or changed host keys are rejected.
- The campus backend is **shared and real**: writes from the UI change its data. Use
  the preview or the local stack to try write actions.
- Process state and logs go to the ignored `.local-dev/` folder.

## Checks

```bash
cd web && npm run build                 # production build
docker compose config -q                # compose file is valid
python -m compileall -q services ai     # every Python file compiles
```

`vue-tsc` type checking is not wired up yet. A passing Vite build is not a type check.
