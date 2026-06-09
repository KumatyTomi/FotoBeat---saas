# FotoBeat.me — następny backend sprint

## Cel sprintu

Zamienić frontendowe MVP w pełny przepływ SaaS z API, storage i workerem renderującym.

## Zakres backendu v0

### API

Endpointy:

```text
POST /api/projects
GET  /api/projects
GET  /api/projects/:id
PATCH /api/projects/:id
POST /api/projects/:id/assets
POST /api/projects/:id/renders
GET  /api/renders/:id
```

### Storage

Minimalne buckety:

```text
uploads/originals
uploads/thumbnails
renders/output
renders/manifests
```

### DB

Tabele:

```text
users
projects
assets
render_jobs
project_snapshots
```

### Queue

Render job powinien mieć:

- `queued`,
- `rendering`,
- `done`,
- `failed`,
- progress 0-100,
- logs,
- manifest JSON,
- output URL.

## Priorytety implementacyjne

1. Wybrać backend: FastAPI albo Node/Fastify.
2. Dodać PostgreSQL schema.
3. Dodać storage provider: Supabase Storage / S3 / R2.
4. Dodać endpoint uploadu assetów.
5. Dodać endpoint tworzenia render joba z manifestu.
6. Dodać worker mock, który tylko zapisuje output URL.
7. Dopiero potem podpiąć prawdziwy FFmpeg.

## Proponowany stack szybki

- Frontend: React/Vite.
- API: FastAPI.
- DB: PostgreSQL.
- Queue: Redis + RQ/Celery albo BullMQ, jeśli backend będzie Node.
- Storage: Cloudflare R2 albo Supabase Storage.
- Render: FFmpeg CLI w workerze.

## Kontrakt render joba

Frontend wysyła `fotobeat.render.v1` manifest. Backend waliduje, zapisuje manifest i tworzy job. Worker czyta manifest, pobiera assets, renderuje i aktualizuje job.

## Nie robić jeszcze

- płatności,
- pełnej autoryzacji multi-tenant,
- marketplace efektów,
- zaawansowanego AI.

Najpierw trzeba uzyskać pierwszy end-to-end flow: upload → manifest → job → mock output → download.
