# FotoBeat.me — frontend/backend sync plan

## Aktualny stan

Frontend działa lokalnie i ma opcjonalny panel `Backend Sync`, który komunikuje się z FastAPI pod `VITE_API_BASE_URL`.

Backend obsługuje:

- tworzenie projektów,
- upload assetów,
- listę assetów projektu,
- tworzenie render jobów z manifestu,
- listę render jobów projektu,
- symulację postępu renderu.

## Docelowy flow sync

```text
1. User tworzy projekt lokalnie lub wchodzi do edytora.
2. Frontend sprawdza /health.
3. Frontend tworzy projekt API.
4. Każdy zaakceptowany plik lokalny idzie do /assets.
5. Backend zwraca asset ID + storage_url.
6. Frontend mapuje local asset -> remote asset.
7. Render manifest używa remote asset IDs/storage URLs.
8. Frontend tworzy render job.
9. Frontend polluje render job status.
10. Po DONE pokazuje output_url.
```

## Mapowanie assetów

Frontend powinien trzymać przy każdym lokalnym assetcie:

```json
{
  "id": "local-id",
  "remoteId": "asset-api-id",
  "remoteStorageUrl": "/mock-storage/uploads/...",
  "syncStatus": "local|uploading|synced|failed"
}
```

## Najbliższy frontend task

W `handleImagesSelected` i `handleAudioSelected`:

- po lokalnym utworzeniu assetu sprawdzić, czy istnieje `remoteProject`,
- jeżeli tak, wywołać `apiClient.uploadAsset(remoteProject.id, file)`,
- po odpowiedzi dopisać `remoteId`, `remoteStorageUrl`, `syncStatus: synced`,
- przy błędzie ustawić `syncStatus: failed` i pokazać `apiError`.

## Najbliższy backend task

Dodać persistent DB i storage:

- PostgreSQL dla `projects`, `assets`, `render_jobs`,
- Cloudflare R2/S3/Supabase Storage dla plików,
- worker queue dla renderów.

## Ważne

Na tym etapie frontend nadal może działać bez backendu. Backend Sync ma być progresywnym ulepszeniem, nie blokadą edytora.
