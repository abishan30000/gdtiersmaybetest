import React, { useEffect, useMemo, useState } from 'react';
import { AddEntryModal } from './AddEntryModal';
import { useAuth, useConfig, useEntries } from '../lib/store';
import { api } from '../lib/api';
import type { Config } from '../types/models';

export function AdminPanel() {
  const { config, refresh: refreshConfig } = useConfig();
  const { token } = useAuth();
  const { refresh: refreshEntries, refreshAssets, createEntry } = useEntries();

  const [adminEditing, setAdminEditing] = useState<boolean>(() => localStorage.getItem('gd_admin_editing') === '1');
  const [addOpen, setAddOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [draft, setDraft] = useState<Pick<Config, 'aspectWeights' | 'defaultAspectValue'>>(() => ({
    aspectWeights: config?.aspectWeights ?? {},
    defaultAspectValue: config?.defaultAspectValue ?? 3
  }));

  useEffect(() => {
    localStorage.setItem('gd_admin_editing', adminEditing ? '1' : '0');
  }, [adminEditing]);

  useEffect(() => {
    if (!config) return;
    setDraft({ aspectWeights: config.aspectWeights ?? {}, defaultAspectValue: config.defaultAspectValue ?? 3 });
  }, [config]);

  const totalWeight = useMemo(() => {
    if (!config) return 0;
    return config.aspects.reduce((sum, a) => sum + Number(draft.aspectWeights?.[a] ?? 1), 0);
  }, [config, draft]);

  if (!config || !token) return null;

  const canEditConfig = Boolean(config.allowConfigEdit);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await fn();
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const handleBulkImport = async (file: File) => {
    if (!adminEditing) return;
    await run(async () => {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('Import JSON must be an array of entries');

      let created = 0;
      for (const raw of data) {
        const name = String(raw?.name ?? '').trim();
        if (!name) continue;
        const image = raw?.image ? String(raw.image) : config.placeholderImage;
        const notes = raw?.notes ? String(raw.notes) : '';
        const aspectsObj: Record<string, any> = typeof raw?.aspects === 'object' && raw.aspects ? raw.aspects : {};

        // Keep only known aspect keys
        const aspects: Record<string, any> = {};
        for (const a of config.aspects) {
          if (aspectsObj[a] != null && String(aspectsObj[a]).trim()) aspects[a] = String(aspectsObj[a]).trim();
        }

        await createEntry({ name, image, notes, aspects } as any);
        created += 1;
      }

      await refreshEntries();
      await refreshAssets();
      setMsg(`Imported ${created} entries.`);
    });
  };

  const saveConfig = async () => {
    if (!adminEditing || !canEditConfig) return;
    await run(async () => {
      await api.updateConfig(
        {
          aspectWeights: draft.aspectWeights,
          defaultAspectValue: Number(draft.defaultAspectValue)
        } as any,
        token
      );
      await refreshConfig();
      await refreshEntries();
      setMsg('Config saved. Scores recalculated.');
    });
  };

  const resetSample = async () => {
    if (!adminEditing) return;
    if (!confirm('Reset backend entries to the included sample seed?')) return;
    await run(async () => {
      await api.resetDev(token);
      await refreshEntries();
      setMsg('Reset complete.');
    });
  };

  return (
    <div className="rounded-2xl border border-line bg-bg-card px-4 py-3 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-white">Admin</div>
          <div className="text-xs text-white/50">Enable admin editing to modify data.</div>
        </div>
        <button
          className={
            adminEditing
              ? 'rounded-xl bg-accent px-3 py-2 text-xs font-extrabold text-black hover:bg-accent-2'
              : 'rounded-xl border border-line bg-white/5 px-3 py-2 text-xs font-extrabold text-white/80 hover:bg-white/10'
          }
          onClick={() => setAdminEditing((v) => !v)}
          aria-label="Toggle admin editing"
        >
          Admin editing: {adminEditing ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        <button
          className="rounded-xl border border-line bg-white/5 px-4 py-2 text-sm font-extrabold text-white/85 hover:bg-white/10 disabled:opacity-60"
          onClick={() => setAddOpen(true)}
          disabled={!adminEditing || busy}
          aria-label="Add entry"
        >
          Add entry
        </button>

        <div className="rounded-2xl border border-line bg-black/20 p-3">
          <div className="text-xs font-extrabold text-white/80">Bulk import (JSON)</div>
          <div className="mt-1 text-xs text-white/50">Upload an array of entries: name, aspects, optional image path.</div>
          <input
            type="file"
            accept="application/json"
            disabled={!adminEditing || busy}
            className="mt-2 block w-full text-xs text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/15"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleBulkImport(f);
              e.currentTarget.value = '';
            }}
            aria-label="Bulk import JSON"
          />
        </div>

        {canEditConfig ? (
          <div className="rounded-2xl border border-line bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-white/80">Config (weights)</div>
              <div className="text-xs text-white/50">Total: {totalWeight.toFixed(2)}</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              {config.aspects.map((a) => (
                <div key={a} className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-white/70" htmlFor={`w-${a}`}>
                    {a}
                  </label>
                  <input
                    id={`w-${a}`}
                    type="number"
                    step="0.1"
                    min={0}
                    disabled={!adminEditing || busy}
                    value={draft.aspectWeights?.[a] ?? 1}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        aspectWeights: { ...p.aspectWeights, [a]: Number(e.target.value) }
                      }))
                    }
                    className="w-24 rounded-xl border border-line bg-bg px-3 py-1.5 text-xs text-white"
                    aria-label={`${a} weight`}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-bold text-white/70" htmlFor="defaultAspect">
                  defaultAspectValue
                </label>
                <input
                  id="defaultAspect"
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  disabled={!adminEditing || busy}
                  value={draft.defaultAspectValue}
                  onChange={(e) => setDraft((p) => ({ ...p, defaultAspectValue: Number(e.target.value) }))}
                  className="w-24 rounded-xl border border-line bg-bg px-3 py-1.5 text-xs text-white"
                  aria-label="Default aspect value"
                />
              </div>
            </div>

            <button
              className="mt-3 w-full rounded-xl bg-accent px-4 py-2 text-sm font-extrabold text-black hover:bg-accent-2 disabled:opacity-60"
              onClick={() => void saveConfig()}
              disabled={!adminEditing || busy}
              aria-label="Save config"
            >
              Save config
            </button>

            <div className="mt-2 text-[11px] text-white/45">
              Writes to <span className="font-mono">config.json</span> (and <span className="font-mono">backend/data/config.json</span>).
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-black/20 p-3 text-xs text-white/55">
            Config edits are disabled (<span className="font-mono">allowConfigEdit=false</span>).
          </div>
        )}

        <button
          className="rounded-xl border border-line bg-white/5 px-4 py-2 text-sm font-extrabold text-white/85 hover:bg-white/10 disabled:opacity-60"
          onClick={() => void resetSample()}
          disabled={!adminEditing || busy}
          aria-label="Reset sample data"
        >
          Reset sample data
        </button>

        {msg ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">{msg}</div> : null}
        {err ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{err}</div> : null}
      </div>

      <AddEntryModal open={addOpen} onClose={() => setAddOpen(false)} />

      <div className="mt-3 text-xs text-white/40">
        Requires login. Editor changes save to backend JSON storage.
      </div>
    </div>
  );
}
