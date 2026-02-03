import React, { useMemo, useState } from 'react';
import { Modal } from './Modal';
import { useAuth, useConfig, useEntries } from '../lib/store';
import { ALLOWED_RATINGS } from '../utils/scoring';
import type { Rating } from '../types/models';

export function AddEntryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config } = useConfig();
  const { isAdmin, token } = useAuth();
  const { createEntry, assets, refreshAssets } = useEntries();
  const [name, setName] = useState('');
  const [aspects, setAspects] = useState<Record<string, Rating | ''>>({});
  const [image, setImage] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setName('');
    setAspects({});
    setNotes('');
    setError(null);
    setImage(config?.placeholderImage ?? 'assets/questionmark.png');
  }, [open, config]);

  const canSave = useMemo(() => isAdmin && !!name.trim() && !busy, [isAdmin, name, busy]);

  if (!config) return null;

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
      setImage(data.path);
      await refreshAssets();
    } catch {
      setError('Upload failed (PNG only)');
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setBusy(true);
    setError(null);
    try {
      await createEntry({ name: name.trim(), aspects: aspects as any, image: image || config.placeholderImage, notes } as any);
      onClose();
    } catch {
      setError('Failed to add entry');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="Add entry" onClose={onClose}>
      {!isAdmin ? (
        <div className="text-sm text-white/70">Log in to add entries.</div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-bold text-white/80" htmlFor="newName">
              Name <span className="text-accent">*</span>
            </label>
            <input
              id="newName"
              className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-white placeholder:text-white/30"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="rounded-2xl border border-line bg-bg-card2 p-3">
            <div className="text-sm font-extrabold text-white">Image (PNG)</div>
            <div className="mt-3 flex items-start gap-3">
              <img
                src={`/${image || config.placeholderImage}`}
                alt=""
                className="h-16 w-16 rounded-2xl border border-line object-cover"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).src = '/assets/questionmark.png';
                }}
              />
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-bold text-white/70" htmlFor="assetSelect">
                  Choose from assets folder
                </label>
                <select
                  id="assetSelect"
                  className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-white"
                  value={image || config.placeholderImage}
                  onChange={(e) => setImage(e.target.value)}
                >
                  <option value={config.placeholderImage}>{config.placeholderImage}</option>
                  {assets.map((a) => (
                    <option key={a.path} value={a.path}>
                      {a.name}
                    </option>
                  ))}
                </select>

                <label className="block text-xs font-bold text-white/70" htmlFor="fileNew">
                  Or upload a PNG (saved into {config.assetsFolder}/)
                </label>
                <input
                  id="fileNew"
                  type="file"
                  accept="image/png"
                  className="block w-full text-xs text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/15"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUpload(f);
                  }}
                />

                <div className="text-xs text-white/50">If you do not choose or upload an image, the placeholder is used.</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-extrabold text-white">Aspects</div>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {config.aspects.map((aspect) => (
                <div key={aspect}>
                  <label className="block text-xs font-bold text-white/70" htmlFor={`new-${aspect}`}>
                    {aspect}
                  </label>
                  <select
                    id={`new-${aspect}`}
                    className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-white"
                    value={(aspects as any)?.[aspect] ?? ''}
                    onChange={(e) => setAspects((p) => ({ ...p, [aspect]: e.target.value as any }))}
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
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80" htmlFor="newNotes">
              Notes (optional)
            </label>
            <textarea
              id="newNotes"
              className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-white"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl bg-accent px-4 py-2 font-extrabold text-black hover:bg-accent-2 disabled:opacity-60"
              disabled={!canSave}
              type="submit"
              aria-label="Add entry"
            >
              Add
            </button>
            <button
              type="button"
              className="rounded-xl border border-line px-4 py-2 font-extrabold text-white/80 hover:bg-white/10"
              onClick={onClose}
              aria-label="Close add modal"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
