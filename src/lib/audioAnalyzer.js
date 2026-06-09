export async function createAudioAsset(file) {
  const fallback = createFallbackAudioAsset(file);

  if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
    return fallback;
  }

  try {
    const AudioContextClass = AudioContext || webkitAudioContext;
    const context = new AudioContextClass();
    const buffer = await file.arrayBuffer();
    const decoded = await context.decodeAudioData(buffer.slice(0));
    await context.close?.();

    return {
      ...fallback,
      duration: Number(decoded.duration.toFixed(2)),
      bpm: estimateBpmFromDuration(decoded.duration),
      channels: decoded.numberOfChannels,
      sampleRate: decoded.sampleRate,
      energy: decoded.duration > 60 ? 'medium' : 'high'
    };
  } catch (error) {
    return {
      ...fallback,
      warning: `Audio decode fallback: ${error.message}`
    };
  }
}

export function createFallbackAudioAsset(file) {
  return {
    id: createId('audio'),
    type: 'audio',
    name: file.name,
    size: file.size,
    mimeType: file.type,
    duration: 45,
    bpm: 128,
    energy: 'unknown',
    source: 'local',
    createdAt: new Date().toISOString()
  };
}

export function estimateBpmFromDuration(duration) {
  if (duration <= 20) return 140;
  if (duration <= 45) return 128;
  if (duration <= 90) return 118;
  return 104;
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
