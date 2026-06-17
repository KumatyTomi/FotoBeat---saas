# FotoBeat.me — SaaS generator of videos from photos and music

FotoBeat.me is a SaaS application for automatically creating short music videos, reels and visualizations from a batch of photos and an audio file. The idea is simple: you upload photos and an MP3, and the system chooses the best frames, selects the tempo, applies filters and transitions and generates a ready‑to‑use clip in 16:9 and 9:16 formats.

## Main product promise

**Upload photos + music. FotoBeat will make a clip in the rhythm of the beat.**

## Repository status

This repository is a large initial scaffold for the project: a front‑end demo, backlog, architecture, rendering pipeline and CI workflow. The code is prepared as a base for further development using Base44 / Vite / React or as a starting point for a full SaaS product.

## Modules

- `Home` — main project editor
- `Projects` — project hub
- `Roadmap` — view of development stages
- `UploadZone` — upload areas for photos and audio
- `Timeline` — timeline demo with beats and effects
- `RenderPanel` — export settings and render queue
- `beatPlanner` — sketch of shot planning algorithm based on BPM
- `renderQueue` — sketch of the render queue

## Starter stack

- React
- Vite
- CSS without a heavy framework
- GitHub Actions CI

## Local run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Roadmap v1

1. Upload photos and MP3
2. Analyse audio length and rhythm
3. Auto‑select photos
4. Timeline with transitions
5. Render preview in the browser
6. Export MP4 in 16:9 and 9:16
7. User projects
8. Templates: Neon, Dark Loft, Cyber Bloom, Family Story, Club Recap

## Roadmap v4

- AI scene selector
- Beat detection
- Render worker backend
- Render queues
- Payments
- User accounts
- Public landing pages for projects
- Marketplace for effects
- Presets for TikTok / Reels / YouTube Shorts

## Repo owner

`KumatyTomi/FotoBeat---saas`
