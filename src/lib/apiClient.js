const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

async function upload(path, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  return response.json();
}

async function readErrorMessage(response) {
  try {
    const payload = await response.json();
    return payload.detail ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  health() {
    return request('/health');
  },

  createProject(payload) {
    return request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  listProjects() {
    return request('/api/projects');
  },

  uploadAsset(projectId, file) {
    return upload(`/api/projects/${projectId}/assets`, file);
  },

  listAssets(projectId) {
    return request(`/api/projects/${projectId}/assets`);
  },

  createRenderJob(projectId, manifest) {
    return request(`/api/projects/${projectId}/renders`, {
      method: 'POST',
      body: JSON.stringify({ manifest })
    });
  },

  getRenderJob(renderId) {
    return request(`/api/renders/${renderId}`);
  },

  advanceRenderJob(renderId) {
    return request(`/api/renders/${renderId}/advance`, {
      method: 'POST'
    });
  }
};
