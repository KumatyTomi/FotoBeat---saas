# FotoBeat.me — SaaS generator filmów ze zdjęć i muzyki

FotoBeat.me to aplikacja SaaS do automatycznego tworzenia krótkich teledysków, rolek i wizualizacji z paczki zdjęć oraz pliku audio. Założenie: użytkownik wrzuca zdjęcia i MP3, a system sam wybiera najlepsze kadry, dobiera tempo, filtry, przejścia i generuje gotowy materiał w formatach 16:9 oraz 9:16.

## Główna obietnica produktu

**Wrzuć zdjęcia + muzykę. FotoBeat sam zrobi klip w rytm bitu.**

## Status repo

To jest duży startowy scaffold projektu: frontend demo, backlog, architektura, pipeline renderowania i workflow CI. Kod jest przygotowany jako baza do dalszej rozbudowy w Base44 / Vite / React lub jako punkt wyjścia do pełnego SaaS.

## Moduły

- `Home` — główny edytor projektu.
- `Projects` — hub projektów.
- `Roadmap` — widok etapów rozwoju.
- `UploadZone` — strefy uploadu zdjęć i audio.
- `Timeline` — demo osi czasu z beatami i efektami.
- `RenderPanel` — ustawienia eksportu i kolejki renderowania.
- `beatPlanner` — szkic algorytmu planowania ujęć pod BPM.
- `renderQueue` — szkic kolejki renderowania.

## Stack startowy

- React
- Vite
- CSS bez ciężkiego frameworka
- GitHub Actions CI

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Build produkcyjny:

```bash
npm run build
npm run preview
```

## Kierunek v1

1. Upload zdjęć i MP3.
2. Analiza długości audio i rytmu.
3. Auto-selekcja zdjęć.
4. Timeline z przejściami.
5. Render preview w przeglądarce.
6. Eksport MP4 16:9 i 9:16.
7. Projekty użytkownika.
8. Szablony: Neon, Dark Loft, Cyber Bloom, Family Story, Club Recap.

## Kierunek v4

- AI scene selector.
- Beat detection.
- Render worker backend.
- Kolejka renderów.
- Płatności.
- Konta użytkowników.
- Publiczne landing pages dla projektów.
- Marketplace efektów.
- Presety pod TikTok / Reels / YouTube Shorts.

## Repo owner

`KumatyTomi/FotoBeat---saas`
