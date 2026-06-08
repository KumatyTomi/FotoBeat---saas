export function estimateBeatGrid({ durationSeconds, bpm }) {
  const beatLength = 60 / bpm;
  const beats = [];

  for (let time = 0; time < durationSeconds; time += beatLength) {
    beats.push({
      index: beats.length,
      time: Number(time.toFixed(3)),
      bar: Math.floor(beats.length / 4) + 1,
      strength: beats.length % 4 === 0 ? 'downbeat' : 'beat'
    });
  }

  return beats;
}

export function planCutsFromAssets({ assets, durationSeconds, bpm, minShot = 2, maxShot = 5 }) {
  const sortedAssets = [...assets].sort((a, b) => b.score - a.score);
  const beatLength = 60 / bpm;
  const timeline = [];
  let cursor = 0;
  let index = 0;

  while (cursor < durationSeconds && sortedAssets.length > 0) {
    const bars = index % 3 === 0 ? 2 : 1;
    const rawLength = bars * 4 * beatLength;
    const shotLength = Math.min(maxShot, Math.max(minShot, rawLength));
    const asset = sortedAssets[index % sortedAssets.length];

    timeline.push({
      start: Number(cursor.toFixed(2)),
      end: Number(Math.min(durationSeconds, cursor + shotLength).toFixed(2)),
      assetId: asset.id,
      effect: chooseEffect(asset.tags, index),
      intensity: Number((0.55 + Math.min(0.4, asset.score / 250)).toFixed(2))
    });

    cursor += shotLength;
    index += 1;
  }

  return timeline;
}

function chooseEffect(tags, index) {
  if (tags.includes('portrait')) return 'neon-parallax';
  if (tags.includes('laser')) return 'laser-slice';
  if (tags.includes('crowd')) return 'beat-shake';
  if (index % 2 === 0) return 'spiral-zoom';
  return 'smoke-cut';
}
