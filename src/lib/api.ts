import type { Config, Entry, AssetItem } from '../types/models';

export type Session = { token: string };

async function request<T>(url: string, opts: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    ...(opts.headers as any)
  };
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  getConfig: () => request<Config>('/api/config'),
  getEntries: () => request<Entry[]>('/api/entries'),
  login: (username: string, password: string) => request<Session>('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  createEntry: (entry: Partial<Entry>, token: string) => request<Entry>('/api/entries', { method: 'POST', body: JSON.stringify(entry) }, token),
  updateEntry: (id: string, patch: Partial<Entry>, token: string) => request<Entry>(`/api/entries/${id}`, { method: 'PUT', body: JSON.stringify(patch) }, token),
  deleteEntry: (id: string, token: string) => request<{ ok: boolean }>(`/api/entries/${id}`, { method: 'DELETE' }, token),
  uploadPng: async (file: File, token: string) => {
    const fd = new FormData();
    fd.append('file', file);
    return request<{ path: string }>('/api/upload', { method: 'POST', body: fd }, token);
  },
  updateConfig: (patch: Partial<Config>, token: string) => request<Config>('/api/config', { method: 'PUT', body: JSON.stringify(patch) }, token),
  resetDev: (token: string) => request<{ ok: boolean; count: number }>('/api/dev/reset', { method: 'POST' }, token),
  getAssetsManifest: () => request<{ assets: AssetItem[] }>('/api/assets-manifest')
};
