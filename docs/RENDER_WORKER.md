# FotoBeat.me — render worker plan

## Cel

Render worker ma zamienić `fotobeat.render.v1` manifest JSON na gotowy plik MP4. Manifest jest tworzony po stronie frontendu i zawiera projekt, audio, output profile, assety oraz timeline.

## Input

```json
{
  "schemaVersion": "fotobeat.render.v1",
  "project": { "id": "...", "title": "..." },
  "audio": { "name": "song.mp3", "duration": 45, "bpm": 128 },
  "output": { "width": 1080, "height": 1920, "fps": 30 },
  "assets": [],
  "timeline": []
}
```

## Etapy workera

1. Validate manifest.
2. Resolve asset paths from storage.
3. Generate normalized frame plan.
4. Apply crop profile per output ratio.
5. Render still images into video clips.
6. Apply transitions/effects.
7. Mix audio.
8. Encode MP4.
9. Upload output to storage.
10. Update render job status.

## MVP worker

Najprostsza wersja może działać jako Node.js service z FFmpeg CLI:

```text
api receives render job
  -> queue stores job
  -> worker downloads assets
  -> worker writes temp concat list
  -> ffmpeg renders mp4
  -> worker uploads mp4
  -> api marks job done
```

## Statusy

- `queued`
- `rendering`
- `done`
- `failed`

## Logi

Każdy job powinien zapisywać logi:

- manifest accepted,
- assets resolved,
- timeline normalized,
- frames composited,
- audio synced,
- mp4 encoded,
- output uploaded.

## FFmpeg sketch

Pierwszy bardzo prosty render może użyć zdjęć jako inputów i audio jako ścieżki:

```bash
ffmpeg -y \
  -loop 1 -t 3 -i image1.jpg \
  -loop 1 -t 3 -i image2.jpg \
  -i audio.mp3 \
  -filter_complex "..." \
  -map "[v]" -map 2:a \
  -c:v libx264 -pix_fmt yuv420p -c:a aac output.mp4
```

## Następne decyzje techniczne

- Czy render lokalny przez WASM wystarczy do preview?
- Czy produkcyjny render robimy w Node workerze, Python workerze, czy serverless jobs?
- Gdzie trzymamy oryginały i outputy: S3, Cloudflare R2, Supabase Storage?
- Jak naliczać render credits?
- Jak czyścić temp files i stare rendery?
