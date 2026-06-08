# FotoBeat.me — mega roadmap rozwojowy

## Etap 0 — repo i demo

- [x] README produktu.
- [x] Vite + React scaffold.
- [x] Demo edytora.
- [x] Demo timeline.
- [x] Presety efektów.
- [x] Render queue mock.
- [x] GitHub Actions CI.

## Etap 1 — prawdziwy frontend MVP

- [ ] Upload zdjęć z drag & drop.
- [ ] Upload MP3.
- [ ] Lokalny podgląd zdjęć.
- [ ] Walidacja typów plików.
- [ ] Limity paczki uploadu.
- [ ] Podstawowy project state.
- [ ] Autosave do localStorage.
- [ ] Snapshots projektu.
- [ ] Routing: home, projects, editor, render status.
- [ ] Responsywność mobile-first.

## Etap 2 — audio engine

- [ ] Web Audio API decode.
- [ ] Waveform preview.
- [ ] Estymacja BPM.
- [ ] Wykrywanie dropów.
- [ ] Wykrywanie segmentów: intro, build, drop, outro.
- [ ] Beat grid snapping.
- [ ] Energia audio per segment.

## Etap 3 — image intelligence

- [ ] Thumbnail generator.
- [ ] Dedup zdjęć.
- [ ] Ocena ostrości.
- [ ] Ocena jasności.
- [ ] Orientacja: portrait/landscape/square.
- [ ] Face/subject detection.
- [ ] Hero shot scoring.
- [ ] Auto crop pod 9:16 i 16:9.

## Etap 4 — timeline editor

- [ ] Drag reorder.
- [ ] Trim klipów.
- [ ] Beat snapping.
- [ ] Manual override efektu.
- [ ] Manual override cropu.
- [ ] Warstwy: image, overlay, text, particles.
- [ ] Transitions library.
- [ ] Preview playback.

## Etap 5 — render engine

- [ ] FFmpeg/WASM proof of concept.
- [ ] Backend render worker proof of concept.
- [ ] Export 9:16 1080x1920.
- [ ] Export 16:9 1920x1080.
- [ ] Export 1:1 1080x1080.
- [ ] Queue status.
- [ ] Retry failed jobs.
- [ ] Render logs.
- [ ] Download MP4.

## Etap 6 — SaaS

- [ ] Auth.
- [ ] User projects.
- [ ] Cloud storage.
- [ ] Plan Free / Creator / Pro.
- [ ] Stripe checkout.
- [ ] Render credits.
- [ ] Watermark dla free.
- [ ] Billing portal.

## Etap 7 — templates marketplace

- [ ] Neon Pulse.
- [ ] Dark Loft Gold.
- [ ] Cyber Bloom.
- [ ] Family Story.
- [ ] Club Recap.
- [ ] Wedding Story.
- [ ] Product Promo.
- [ ] Real Estate Walkthrough.

## Etap 8 — AI upgrade

- [ ] Prompt do stylu filmu.
- [ ] Auto storyboard.
- [ ] Smart scene ordering.
- [ ] Text overlay generator.
- [ ] Caption generator.
- [ ] Voiceover sync.
- [ ] Music mood classifier.

## Etap 9 — growth

- [ ] Public project pages.
- [ ] Share links.
- [ ] SEO landing pages.
- [ ] TikTok/Reels export presets.
- [ ] Referral system.
- [ ] Gallery przykładów.
- [ ] Before/after showcase.

## Definition of Done v1

Użytkownik może:

1. wejść na stronę,
2. utworzyć projekt,
3. wrzucić zdjęcia i MP3,
4. dostać automatyczny timeline,
5. wybrać preset,
6. odpalić render,
7. pobrać MP4.
