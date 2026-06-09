const STORAGE_KEY = 'fotobeat.project.v1';
const SNAPSHOT_KEY = 'fotobeat.snapshots.v1';

export function loadStoredProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredProject(project) {
  const safeProject = stripVolatilePreviewUrls(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeProject));
}

export function loadSnapshots() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSnapshot(project, label = 'Manual snapshot') {
  const snapshots = loadSnapshots();
  const snapshot = {
    id: `snapshot-${Date.now()}`,
    label,
    createdAt: new Date().toISOString(),
    project: stripVolatilePreviewUrls(project)
  };

  const nextSnapshots = [snapshot, ...snapshots].slice(0, 12);
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(nextSnapshots));

  return nextSnapshots;
}

export function clearStoredProject() {
  localStorage.removeItem(STORAGE_KEY);
}

function stripVolatilePreviewUrls(project) {
  return {
    ...project,
    assets: project.assets.map((asset) => ({
      ...asset,
      previewUrl: asset.previewUrl?.startsWith('blob:') ? null : asset.previewUrl
    }))
  };
}
