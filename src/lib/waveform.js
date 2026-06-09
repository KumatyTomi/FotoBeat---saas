export function extractWaveformPeaks(audioBuffer, buckets = 96) {
  const channel = audioBuffer.getChannelData(0);
  const samplesPerBucket = Math.max(1, Math.floor(channel.length / buckets));
  const peaks = [];

  for (let bucket = 0; bucket < buckets; bucket += 1) {
    const start = bucket * samplesPerBucket;
    const end = Math.min(channel.length, start + samplesPerBucket);
    let sum = 0;

    for (let index = start; index < end; index += 1) {
      sum += Math.abs(channel[index]);
    }

    peaks.push(sum / Math.max(1, end - start));
  }

  return normalizePeaks(peaks);
}

export function createSyntheticWaveform(buckets = 96, seed = 128) {
  const peaks = Array.from({ length: buckets }, (_, index) => {
    const waveA = Math.sin((index + seed) * 0.23) * 0.5 + 0.5;
    const waveB = Math.sin((index + seed) * 0.071) * 0.5 + 0.5;
    const pulse = index % 8 === 0 ? 0.34 : 0;
    return Math.min(1, 0.18 + waveA * 0.42 + waveB * 0.28 + pulse);
  });

  return normalizePeaks(peaks);
}

export function normalizePeaks(peaks) {
  const max = Math.max(...peaks, 0.001);
  return peaks.map((peak) => Number(Math.max(0.06, peak / max).toFixed(3)));
}
