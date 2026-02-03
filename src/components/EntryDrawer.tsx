import React, { useMemo, useState } from 'react';
import type { Entry, Rating } from '../types/models';
import { useAuth, useConfig, useEntries } from '../lib/store';
import { ALLOWED_RATINGS, computeWeightedScore, buildExplanation } from '../utils/scoring';
import { bucketTier } from '../utils/scoring';
import { tierColor } from './tiers';

export function EntryDrawer({ open, entry, onClose }: { open: boolean; entry: Entry | null; onClose: () => void }) {
  const { config } = useConfig();
  const { isAdmin, token } = useAuth();
  const { updateEntry, deleteEntry, assets, refreshAssets } = useEntries();

  const [localAspects, setLocalAspects] = useState<Record<string, Rating | ''>>({});
  const [localImage, setLocalImage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!entry) return;
    setLocalAspects(entry.aspects as any);
    setLocalImage(entry.image || (config?.placeholderImage ?? 'assets/questionmark.png'));
    setNotes(entry.notes || '');
    setError(null);
  }, [entry, config]);

  const computed = useMemo(() => {
    if (!config) return { score: 0, percent: 0 };
    return computeWeightedScore(localAspects as any, config);
  }, [localAspects, config]);

  const explanation = useMemo(() => {
    if (!config) return '';
    return buildExplanation(localAspects as any, config);
  }, [localAspects, config]);

  if (!open || !entry || !config) return null;

  const tier = bucketTier(computed.score);

  const onSave = async () => {
    if (!isAdmin) return;
    setBusy(true);
    setError(null);
    try {
      await updateEntry(entry.id, { aspects: localAspects as any, image: localImage, notes });
      onClose();
    } catch (e: any) {
      setError('Failed to save. Check backend is running.');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!isAdmin) return;
    if (!confirm(`Delete ${entry.name}?`)) return;
    setBusy(true);
    try {
      await deleteEntry(entry.id);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const onUpload = async (file: File) => {
    if (!isAdmin || !token) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { path: string };
      setLocalImage(data.path);
      await refreshAssets();
    } catch {
      setError('Upload failed (PNG only)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-line bg-bg shadow-soft">
        <div className="sticky top-0 border-b border-line bg-bg/90 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-white/50">Quick panel</div>
              <div className="truncate font-baloo text-xl font-extrabold">{entry.name}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold ${tierColor(tier)}`}>{tier}</span>
                <span className="text-xs text-white/50">
                  {computed.percent}% • {computed.score.toFixed(2)}
                </span>
              </div>
            </div>
            <button className="rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-5 p-4">
          <div className="flex items-start gap-4">
            <img
              src={`/${localImage}`}
              alt=""
              className="h-24 w-24 rounded-2xl border border-line object-cover"
              onError={(ev) => {
                (ev.currentTarget as HTMLImageElement).src = '/assets/questionmark.png';
              }}
            />
            <div className="flex-1 space-y-3">
              <div className="text-sm font-bold text-white">Image</div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/70" htmlFor="assetPick">
                  Choose from assets folder
                </label>
                <select
                  id="assetPick"
                  className="w-full rounded-xl border border-line bg-bg-card px-3 py-2 text-sm text-white"
                  value={localImage}
                  onChange={(e) => setLocalImage(e.target.value)}
                  disabled={!isAdmin}
                >
                  <option value={config.placeholderImage}>{config.placeholderImage}</option>
                  {assets.map((a) => (
                    <option key={a.path} value={a.path}>
                      {a.name}
                    </option>
                  ))}
                </select>

                <div>
                  <label className="block text-xs font-bold text-white/70" htmlFor="uploadPng">
                    Upload PNG (saved into {config.assetsFolder}/)
                  </label>
                  <input
                    id="uploadPng"
                    type="file"
                    accept="image/png"
                    className="mt-1 block w-full text-xs text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/15"
                    disabled={!isAdmin}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void onUpload(f);
                    }}
                  />
                </div>
                {!isAdmin && <div className="text-xs text-white/40">Log in to change images.</div>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-white">Ratings</div>
              {!isAdmin && <span className="text-xs text-white/40">View only</span>}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {config.aspects.map((aspect) => (
                <div key={aspect}>
                  <label className="block text-xs font-bold text-white/70" htmlFor={`aspect-${aspect}`}>
                    {aspect}
                  </label>
                  <select
                    id={`aspect-${aspect}`}
                    className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-white"
                    value={(localAspects as any)?.[aspect] ?? ''}
                    onChange={(e) => setLocalAspects((prev) => ({ ...prev, [aspect]: e.target.value as any }))}
                    disabled={!isAdmin}
                    aria-label={`${aspect} rating`}
                  >
                    <option value="">(default {config.defaultAspectValue})</option>
                    {ALLOWED_RATINGS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-black/20 p-3 text-xs text-white/70">
              <div className="font-bold text-white/90">Calculation</div>
              <div className="mt-2 whitespace-pre-wrap leading-relaxed">{explanation}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-card p-4">
            <div className="text-sm font-extrabold text-white">Notes</div>
            <textarea
              className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-white/90"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!isAdmin}
              aria-label="Notes"
            />
          </div>

          {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-xl bg-accent px-4 py-2 font-extrabold text-black hover:bg-accent-2 disabled:opacity-60"
              onClick={onSave}
              disabled={!isAdmin || busy}
              aria-label="Save changes"
            >
              Save
            </button>
            <button
              className="rounded-xl border border-line px-4 py-2 font-extrabold text-white/80 hover:bg-white/10"
              onClick={onClose}
              aria-label="Cancel"
            >
              Cancel
            </button>

            <div className="flex-1" />

            <button
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 font-extrabold text-red-200 hover:bg-red-500/15 disabled:opacity-60"
              onClick={onDelete}
              disabled={!isAdmin || busy}
              aria-label="Delete entry"
            >
              Delete
            </button>
          </div>

          <div className="text-xs text-white/50">
            PNG images only. If a player has no image, the default placeholder is used.
          </div>
        </div>
      </div>
    </div>
  );
}
