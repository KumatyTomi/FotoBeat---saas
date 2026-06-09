# FotoBeat API — FastAPI mock backend

Backend v0 dla FotoBeat.me. To jest szybki fundament pod przyszły SaaS: projekty, assety, manifest renderu, render joby i mock kolejki.

## Uruchomienie

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Healthcheck

```bash
curl http://localhost:8000/health
```

## API

```text
POST /api/projects
GET  /api/projects
GET  /api/projects/{project_id}
POST /api/projects/{project_id}/assets
GET  /api/projects/{project_id}/assets
POST /api/projects/{project_id}/renders
GET  /api/renders/{render_id}
POST /api/renders/{render_id}/advance
```

## Testy

```bash
cd backend
pytest
```

## Co to robi teraz

- trzyma dane w pamięci procesu,
- zapisuje uploady lokalnie do `mock-storage/uploads`,
- przyjmuje manifest `fotobeat.render.v1`,
- tworzy mock render job,
- symuluje postęp renderowania.

## Co później wymienić

- in-memory store → PostgreSQL,
- mock storage → S3/R2/Supabase Storage,
- `/advance` → prawdziwy worker z kolejki,
- mock output URL → realny MP4 z FFmpeg.
