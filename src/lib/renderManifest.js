export function createRenderManifest({ project, audio, preset, profile, timeline }) {
  return {
    schemaVersion: 'fotobeat.render.v1',
    createdAt: new Date().toISOString(),
    project: {
      id: project.id,
      title: project.title,
      status: project.status
    },
    audio: {
      id: audio?.remoteId ?? audio?.id ?? 'demo-audio',
      localId: audio?.id ?? null,
      name: audio?.name,
      duration: audio?.duration,
      bpm: audio?.bpm,
      energy: audio?.energy,
      waveformBuckets: audio?.waveform?.length ?? 0,
      storageUrl: audio?.remoteStorageUrl ?? null,
      syncStatus: audio?.syncStatus ?? 'local'
    },
    preset: {
      id: preset.id,
      name: preset.name
    },
    output: {
      profileId: profile.id,
      label: profile.label,
      ratio: profile.ratio,
      width: profile.width,
      height: profile.height,
      codec: 'h264',
      container: 'mp4',
      fps: 30
    },
    assets: project.assets.map((asset) => ({
      id: asset.remoteId ?? asset.id,
      localId: asset.id,
      type: asset.type,
      name: asset.name,
      score: asset.score,
      tags: asset.tags ?? [],
      source: asset.source ?? 'unknown',
      storageUrl: asset.remoteStorageUrl ?? null,
      syncStatus: asset.syncStatus ?? 'local'
    })),
    timeline: timeline.map((clip, index) => ({
      index,
      start: clip.start,
      end: clip.end,
      assetId: clip.assetId,
      remoteAssetId: project.assets.find((asset) => asset.id === clip.assetId)?.remoteId ?? null,
      effect: clip.effect,
      intensity: clip.intensity
    }))
  };
}

export function downloadManifest(manifest) {
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `${manifest.project.id}-${manifest.output.profileId}-manifest.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
