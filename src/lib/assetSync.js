export const SYNC_STATUS = {
  LOCAL: 'local',
  UPLOADING: 'uploading',
  SYNCED: 'synced',
  FAILED: 'failed'
};

export function markAssetLocal(asset) {
  return {
    ...asset,
    syncStatus: SYNC_STATUS.LOCAL,
    remoteId: null,
    remoteStorageUrl: null,
    syncError: null
  };
}

export function markAssetUploading(asset) {
  return {
    ...asset,
    syncStatus: SYNC_STATUS.UPLOADING,
    syncError: null
  };
}

export function mergeRemoteAsset(localAsset, remoteAsset) {
  return {
    ...localAsset,
    syncStatus: SYNC_STATUS.SYNCED,
    remoteId: remoteAsset.id,
    remoteStorageUrl: remoteAsset.storage_url,
    remoteContentType: remoteAsset.content_type,
    remoteSizeBytes: remoteAsset.size_bytes,
    syncError: null
  };
}

export function markAssetSyncFailed(asset, error) {
  return {
    ...asset,
    syncStatus: SYNC_STATUS.FAILED,
    syncError: error?.message ?? String(error)
  };
}

export async function uploadAssetToBackend({ apiClient, remoteProjectId, file, localAsset }) {
  if (!remoteProjectId) {
    return markAssetLocal(localAsset);
  }

  try {
    const remoteAsset = await apiClient.uploadAsset(remoteProjectId, file);
    return mergeRemoteAsset(localAsset, remoteAsset);
  } catch (error) {
    return markAssetSyncFailed(localAsset, error);
  }
}

export function buildBackendManifest(manifest) {
  return {
    ...manifest,
    assets: manifest.assets.map((asset) => ({
      ...asset,
      id: asset.remoteId ?? asset.id,
      localId: asset.id,
      storageUrl: asset.remoteStorageUrl ?? asset.storageUrl ?? null,
      syncStatus: asset.syncStatus ?? SYNC_STATUS.LOCAL
    }))
  };
}

export function countSyncedAssets(assets = []) {
  return assets.filter((asset) => asset.syncStatus === SYNC_STATUS.SYNCED).length;
}

export function countFailedAssets(assets = []) {
  return assets.filter((asset) => asset.syncStatus === SYNC_STATUS.FAILED).length;
}
