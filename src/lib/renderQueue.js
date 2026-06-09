export const RENDER_STATUSES = {
  DRAFT: 'draft',
  QUEUED: 'queued',
  RENDERING: 'rendering',
  DONE: 'done',
  FAILED: 'failed'
};

export function createRenderJob({ projectId, profile, preset, timeline, manifest }) {
  return {
    id: `render-${projectId}-${profile.id}-${Date.now()}`,
    projectId,
    profile,
    preset,
    timeline,
    manifest,
    status: RENDER_STATUSES.QUEUED,
    progress: 0,
    createdAt: new Date().toISOString(),
    output: null,
    logs: [
      'Queued render job',
      `Profile: ${profile.ratio} ${profile.width}x${profile.height}`,
      `Preset: ${preset.name}`,
      `Timeline clips: ${timeline.length}`
    ],
    error: null
  };
}

export function simulateRenderProgress(job, step = 18) {
  if (job.status === RENDER_STATUSES.DONE || job.status === RENDER_STATUSES.FAILED) {
    return job;
  }

  const nextProgress = Math.min(100, job.progress + step);
  const nextStatus = nextProgress >= 100 ? RENDER_STATUSES.DONE : RENDER_STATUSES.RENDERING;

  return {
    ...job,
    status: nextStatus,
    progress: nextProgress,
    logs: [...job.logs, createProgressLog(nextProgress, nextStatus)],
    output: nextProgress >= 100 ? `/renders/${job.id}.mp4` : null
  };
}

function createProgressLog(progress, status) {
  if (status === RENDER_STATUSES.DONE) return 'Render complete — MP4 output ready';
  if (progress < 30) return 'Preparing assets and timeline layers';
  if (progress < 60) return 'Compositing frames with selected preset';
  if (progress < 90) return 'Encoding video and syncing audio';
  return 'Finalizing MP4 container';
}
