/**
 * API service communicating with the Python FastAPI ML backend
 */

const API_BASE = '/api';

export const apiService = {
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return { online: false };
      const data = await res.json();
      return { online: true, ...data };
    } catch {
      return { online: false };
    }
  },

  async loadDefaultDataset() {
    const res = await fetch(`${API_BASE}/load-default`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to load local dataset');
    }
    return res.json();
  },

  async uploadCSV(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to upload CSV to backend');
    }
    return res.json();
  },

  async getDatasetStats() {
    const res = await fetch(`${API_BASE}/dataset-stats`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to fetch dataset statistics');
    }
    return res.json();
  },

  async runPCA({ sampleSize, seed = 42 }) {
    const res = await fetch(`${API_BASE}/pca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample_size: sampleSize, seed })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to execute PCA on backend');
    }
    return res.json();
  },

  async runTSNE({ sampleSize = 5000, perplexity = 30, randomState = 42, stratified = true }) {
    const res = await fetch(`${API_BASE}/tsne`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sample_size: sampleSize,
        perplexity,
        random_state: randomState,
        stratified
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to execute t-SNE on backend');
    }
    return res.json();
  }
};
