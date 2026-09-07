/**
 * NWIS backend API client.
 *
 * All calls go through `request()` so the UI keeps working with local mock
 * data when the FastAPI backend is unreachable (demo auto-fallback).
 */
const API_BASE = '/api';
const REQUEST_TIMEOUT_MS = 8000;

async function _post(path, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`API ${res.status} on ${path}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function _get(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`API ${res.status} on ${path}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchSimilarWells(payload) {
  return _post('/similarity/rank', payload);
}

export async function fetchPlanningCandidates(payload) {
  return _post('/planning/candidates', payload);
}

export async function fetchAnalysis(payload) {
  return _post('/analysis', payload);
}

export async function fetchWellEvents(well, limit = 50) {
  return _get(`/events?well=${encodeURIComponent(well)}&limit=${limit}`);
}

export async function fetchWellDetail(well) {
  return _get(`/wells/${encodeURIComponent(well)}`);
}

export function tryBackend(fn) {
  return fn().then(
    (data) => ({ ok: true, data }),
    (err) => ({ ok: false, error: err })
  );
}