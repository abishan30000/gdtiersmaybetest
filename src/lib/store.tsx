import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AssetItem, Config, Entry } from '../types/models';
import { api } from './api';

type ConfigState = {
  config: Config | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const ConfigContext = createContext<ConfigState | null>(null);

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const cfg = await api.getConfig();
      setConfig(cfg);
      document.title = cfg.siteTitle || 'Goober Dash Rankings';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(() => ({ config, loading, refresh }), [config, loading]);
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

// ----------------------
// Auth
// ----------------------

type AuthState = {
  token: string | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('goober_session_token'));

  const login = async (username: string, password: string) => {
    const session = await api.login(username, password);
    localStorage.setItem('goober_session_token', session.token);
    setToken(session.token);
  };

  const logout = () => {
    localStorage.removeItem('goober_session_token');
    setToken(null);
  };

  const value = useMemo(() => ({ token, isAdmin: !!token, login, logout }), [token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ----------------------
// Entries + Assets
// ----------------------

type EntriesState = {
  entries: Entry[];
  loading: boolean;
  refresh: () => Promise<void>;
  assets: AssetItem[];
  refreshAssets: () => Promise<void>;
  createEntry: (input: Partial<Entry>) => Promise<Entry>;
  updateEntry: (id: string, patch: Partial<Entry>) => Promise<Entry>;
  deleteEntry: (id: string) => Promise<void>;
};

const EntriesContext = createContext<EntriesState | null>(null);

export function useEntries() {
  const ctx = useContext(EntriesContext);
  if (!ctx) throw new Error('useEntries must be used within EntriesProvider');
  return ctx;
}

export function EntriesProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await api.getEntries();
      setEntries(list);
    } finally {
      setLoading(false);
    }
  };

  const refreshAssets = async () => {
    const res = await api.getAssetsManifest();
    setAssets(res.assets || []);
  };

  useEffect(() => {
    void refresh();
    void refreshAssets();
  }, []);

  const createEntry = async (input: Partial<Entry>) => {
    if (!token) throw new Error('Not logged in');
    const created = await api.createEntry(input, token);
    setEntries((prev) => [created, ...prev]);
    return created;
  };

  const updateEntry = async (id: string, patch: Partial<Entry>) => {
    if (!token) throw new Error('Not logged in');
    const updated = await api.updateEntry(id, patch, token);
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  };

  const deleteEntry = async (id: string) => {
    if (!token) throw new Error('Not logged in');
    await api.deleteEntry(id, token);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const value = useMemo(
    () => ({ entries, loading, refresh, assets, refreshAssets, createEntry, updateEntry, deleteEntry }),
    [entries, loading, assets, token]
  );

  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
}
