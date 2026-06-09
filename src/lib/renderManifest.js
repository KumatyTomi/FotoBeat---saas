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
      id: audio?.id ?? 'demo-audio',
      name: audio?.name,
      duration: audio?.duration,
      bpm: audio?.bpm,
      energy: audio?.energy,
      waveformBuckets: audio?.waveform?.length ?? 0
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
      id: asset.id,
      type: asset.type,
      name: asset.name,
      score: asset.score,
      tags: asset.tags ?? [],
      source: asset.source ?? 'unknown'
    })),
    timeline: timeline.map((clip, index) => ({
      index,
      start: clip.start,
      end: clip.end,
      assetId: clip.assetId,
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
