# FotoBeat.me — architektura produktu

## Cel techniczny

Zbudować SaaS, który generuje krótkie filmy z paczki zdjęć i audio. System ma działać najpierw jako szybki frontend MVP, potem jako pełny pipeline z backendem, kolejką renderowania i workerami.

## Warstwy

```text
frontend React/Vite
  ├─ upload zdjęć/audio
  ├─ timeline editor
  ├─ presety efektów
  ├─ preview
  └─ projekty użytkownika

backend API
  ├─ auth
  ├─ project storage
  ├─ asset metadata
  ├─ render jobs
  └─ billing/limits

workers
  ├─ audio analysis
  ├─ image scoring
  ├─ timeline generation
  ├─ FFmpeg rendering
  └─ export packaging

storage
  ├─ original uploads
  ├─ thumbnails
  ├─ waveform cache
  ├─ rendered MP4
  └─ project snapshots
```

## Pipeline renderowania

1. User tworzy projekt.
2. Upload zdjęć i MP3.
3. System analizuje audio:
   - długość,
   - waveform,
   - BPM,
   - dropy,
   - poziom energii.
4. System analizuje zdjęcia:
   - ostrość,
   - twarze,
   - duplikaty,
   - orientację,
   - potencjał hero shot.
5. Generator tworzy timeline.
6. Frontend pokazuje preview.
7. User wybiera format eksportu.
8. Render job trafia do kolejki.
9. Worker generuje MP4.
10. User pobiera gotowy film.

## Encje domenowe

### User

- id
- email
- plan
- renderLimit
- storageLimit

### Project

- id
- ownerId
- title
- status
- selectedPreset
- timeline
- exportProfiles
- snapshots

### Asset

- id
- projectId
- type: image/audio/video
- originalUrl
- thumbnailUrl
- metadata
- score

### RenderJob

- id
- projectId
- profile
- status
- progress
- outputUrl
- error

## MVP techniczny

Na start wystarczy:

- React app,
- lokalny stan projektu,
- upload mock / preview mock,
- planowanie timeline po BPM,
- symulacja render queue,
- CI build.

## Docelowy backend

Proponowany stack:

- API: Node.js + Fastify/NestJS albo Python FastAPI.
- DB: PostgreSQL.
- Queue: Redis + BullMQ albo Cloud Tasks.
- Storage: S3/R2.
- Render: FFmpeg worker.
- Auth: Clerk/Supabase/Auth.js.
- Payments: Stripe.

## Ryzyka

- Rendering w przeglądarce może być ciężki na słabszych urządzeniach.
- FFmpeg/WASM ma ograniczenia wydajnościowe.
- Upload dużych paczek zdjęć wymaga limitów i storage policy.
- Beat detection musi być iteracyjnie testowany na prawdziwym audio.
- Koszt renderów może rosnąć szybciej niż przychód bez limitów planów.

## Zasada projektowa

Najpierw szybkie, piękne demo i przepływ użytkownika. Dopiero potem ciężka infrastruktura renderowania.
