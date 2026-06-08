export const RENDER_STATUSES = {
  DRAFT: 'draft',
  QUEUED: 'queued',
  RENDERING: 'rendering',
  DONE: 'done',
  FAILED: 'failed'
};

export function createRenderJob({ projectId, profile, preset, timeline }) {
  return {
    id: `render-${projectId}-${profile.id}-${Date.now()}`,
    projectId,
    profile,
    preset,
    timeline,
    status: RENDER_STATUSES.QUEUED,
    progress: 0,
    createdAt: new Date().toISOString(),
    output: null,
    error: null
  };
}

export function simulateRenderProgress(job, step = 18) {
  if (job.status === RENDER_STATUSES.DONE || job.status === RENDER_STATUSES.FAILED) {
    return job;
  }

  const nextProgress = Math.min(100, job.progress + step);

  return {
    ...job,
    status: nextProgress >= 100 ? RENDER_STATUSES.DONE : RENDER_STATUSES.RENDERING,
    progress: nextProgress,
    output: nextProgress >= 100 ? `/renders/${job.id}.mp4` : null
  };
}
