# FotoBeat.me — asset sync implementation

## Dodane moduły

### `src/lib/assetSync.js`

Statusy:

```js
local
uploading
synced
failed
```

Funkcje:

- `markAssetLocal(asset)`
- `markAssetUploading(asset)`
- `mergeRemoteAsset(localAsset, remoteAsset)`
- `markAssetSyncFailed(asset, error)`
- `uploadAssetToBackend({ apiClient, remoteProjectId, file, localAsset })`
- `buildBackendManifest(manifest)`
- `countSyncedAssets(assets)`
- `countFailedAssets(assets)`

### `src/lib/renderManifest.js`

Manifest ma teraz remote mapping:

```json
{
  "assets": [
    {
      "id": "remote-or-local-id",
      "localId": "local-id",
      "storageUrl": "/mock-storage/uploads/...",
      "syncStatus": "synced"
    }
  ],
  "timeline": [
    {
      "assetId": "local-id",
      "remoteAssetId": "remote-id"
    }
  ]
}
```

## Następny patch w `App.jsx`

W importach:

```js
import { markAssetLocal, uploadAssetToBackend, countSyncedAssets, countFailedAssets } from './lib/assetSync.js';
```

W `handleImagesSelected(files)`:

```js
const imageAssets = accepted.map((file, index) => markAssetLocal(createImageAsset(file, index)));
setProject((current) => ({ ...current, status: 'editing', assets: [...imageAssets, ...current.assets] }));

if (remoteProject) {
  imageAssets.forEach(async (asset, index) => {
    const syncedAsset = await uploadAssetToBackend({
      apiClient,
      remoteProjectId: remoteProject.id,
      file: accepted[index],
      localAsset: asset
    });

    setProject((current) => ({
      ...current,
      assets: current.assets.map((item) => item.id === asset.id ? syncedAsset : item)
    }));
  });
}
```

W `handleAudioSelected(file)`:

```js
let audio = markAssetLocal(await createAudioAsset(accepted));
setProject((current) => ({ ...current, status: 'editing', audio }));

if (remoteProject) {
  const syncedAudio = await uploadAssetToBackend({ apiClient, remoteProjectId: remoteProject.id, file: accepted, localAsset: audio });
  setProject((current) => ({ ...current, audio: syncedAudio }));
}
```

## UX

Dodać przy asset card:

```text
local / uploading / synced / failed
```

Dodać w backend panelu:

```text
Synced assets: X / Y
Failed sync: Z
```

## Uwaga

Frontend dalej powinien działać bez backendu. Sync jest opcjonalny. Jeśli backend jest offline, lokalna edycja i manifest nadal mają działać.
