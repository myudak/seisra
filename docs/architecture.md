# Architecture

## Data flow

```
 stations ──SeedLink──▶ seedlink ──▶ [waveform_seedlink] ──┬──▶ archiver ──▶ /archive (miniSEED, SDS)
                                                           │
                                                           └──▶ p-pick-consumer ──HTTP──▶ p-pick-lb ──▶ p-pick ×N
                                                                                                          │
                                       ┌──────────────────────────────[pick]◀─────────────────────────────┤
                                       ▼                                                                  ▼
                                  association ──▶ [cluster] ──▶ locmag ──▶ [event]          [arrival_waveform]
                                                                  ▲                                       │
                                                                  └── Redis arrival_pick:* ◀── phase-arrival ──▶ [arrival_pick]

 [topic] = Kafka topic. Results land in MongoDB; Redis also holds recent waveforms
 for live traces (the flusher clears it periodically).

 browser ──▶ web (nginx) ──┬── /api/*          ▶ api           :8003  REST (FastAPI)
                           ├── /record-api/*   ▶ record-stream :8001  waveform windows from /archive
                           ├── /socket.io/*    ▶ ws-waveform   :8004  live waveforms (Socket.IO)
                           └── /ws{event,picking,arrivalpick} ▶ ws-general :8005  live events and picks
```

Topic names come from `.env` (`waveform_topic`, `pick_topic`, …).

## Services

| Service | Folder | What it does |
| --- | --- | --- |
| `web` | `web/` | Dashboard. nginx serves the built app and proxies every backend path, so the browser only talks to one origin. |
| `api` | `services/api/` | REST API (`controller_api_app.py`). Seeds the first admin user and stations on start. |
| `ws-general` | `services/api/` | WebSocket for events, picks and arrival picks (`controller_web_socket.py`). |
| `ws-waveform` | `services/api/` | Socket.IO for live waveforms from Redis (`controller_web_socket_redis.py`). |
| `seedlink` | `services/seedlink/` | Pulls SeedLink streams and publishes them to Kafka. Replicas split the station list by replica number. |
| `archiver` | `services/archiver/` | Writes waveforms to `/archive` as miniSEED. Replicated like `seedlink`. |
| `record-stream` | `services/record-stream/` | Serves waveform windows from the archive. |
| `fdsn`, `fdsn-api` | `services/fdsn/` | Fills archive gaps from FDSN and serves FDSN-style queries. |
| `public-api` | `services/public-api/` | Inbound API for external systems. |
| `flusher` | `services/flusher/` | Keeps Redis small by trimming old waveform data. |
| `p-pick`, `p-pick-lb`, `p-pick-consumer` | `ai/p-pick/` | CNN P-wave picker behind an nginx load balancer. |
| `phase-arrival`, `association`, `locmag` | `ai/…` | Arrival detection, event association, location and magnitude. |
| `kafka`, `redis`, `mongodb` | — | Kafka 3.7 (KRaft, no ZooKeeper), Redis 7.2, MongoDB 4.4. |

## Changes from the previous deployment

- **One compose file** instead of a privileged Docker-in-Docker wrapper that started four
  separate compose projects with fixed `sleep` waits. Health checks now order the startup.
- **One `.env`** for every service, instead of one per module plus generated copies.
- **One public port.** nginx in `web` proxies the API and both WebSockets; the frontend
  uses same-origin URLs, so no server IP is compiled into the image.
- **Kafka in KRaft mode**, so ZooKeeper is gone.
- **Only deployed code.** Unused AI variants (`alpha`, `beta`, `neoalpha`, `template`),
  backup scripts, notebooks and the unused newer backend packages were not carried over.
  Model files: only the ones the code loads. The station inventory is stored gzip'd
  (34 MB → 2 MB) and unpacked at image build.

## Known gaps

- Mongo stays on 4.4 so existing data files keep working; it is end-of-life.
- `seedlink` and `archiver` read their replica number through the Docker socket
  (read-only mount). A cleaner option is an explicit `REPLICA_ID`.
- Several controller routes read `ssh_*` settings for an SSH bridge; leave them empty
  when the database is reachable directly.
- No backend tests exist yet. CI checks that every Python file compiles, the
  compose file is valid and the web app builds.
