export function getClipAtTime(timeline, currentTime) {
  return timeline.find((clip) => currentTime >= clip.start && currentTime < clip.end) ?? timeline.at(-1) ?? null;
}

export function getPlaybackDuration(timeline, fallbackDuration = 0) {
  const lastClip = timeline.at(-1);
  return lastClip ? lastClip.end : fallbackDuration;
}

export function getPlaybackProgress(currentTime, duration) {
  if (!duration) return 0;
  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
}

export function advancePreviewTime({ currentTime, timeline, fallbackDuration, delta = 0.5 }) {
  const duration = getPlaybackDuration(timeline, fallbackDuration);
  const nextTime = currentTime + delta;

  if (nextTime >= duration) return 0;
  return Number(nextTime.toFixed(2));
}
