import React, { useMemo, useState } from 'react';
import { HelpOverlay } from '../components/HelpOverlay';
import { TierGrid } from '../components/TierGrid';
import { LeaderboardList } from '../components/LeaderboardList';
import { TierLegend } from '../components/TierLegend';
import { EntryDrawer } from '../components/EntryDrawer';
import { AdminPanel } from '../components/AdminPanel';
import { useAuth, useConfig, useEntries } from '../lib/store';
import type { Entry } from '../types/models';

export function RankingsPage() {
  const { config } = useConfig();
  const { isAdmin } = useAuth();
  const { entries, loading, refresh } = useEntries();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'score' | 'name'>('score');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [helpOpen, setHelpOpen] = useState(false);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...entries];
    if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));
    if (sort === 'score') list.sort((a, b) => (b.computed?.score ?? 0) - (a.computed?.score ?? 0));
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [entries, query, sort]);

  const openEntry = (e: Entry) => {
    setSelected(e);
    setDrawerOpen(true);
  };

  if (!config) {
    return (
      <div className="rounded-2xl border border-line bg-bg-card p-4 shadow-soft">
        Loading config…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <TierLegend />

        <div className="rounded-2xl border border-line bg-bg-card px-4 py-3 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-white">Controls</div>
            <div className="text-xs text-white/50">{filtered.length} entries</div>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="search" className="block text-xs font-bold text-white/70">
                Search
              </label>
              <input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search names…"
                className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>

            <div>
              <label htmlFor="sort" className="block text-xs font-bold text-white/70">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-white"
                aria-label="Sort entries"
              >
                <option value="score">Overall (desc)</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl border border-line bg-white/5 px-3 py-2 text-sm font-extrabold text-white/80 hover:bg-white/10"
                onClick={() => setHelpOpen(true)}
                aria-label="Open help overlay"
              >
                Help
              </button>
              <button
                className="flex-1 rounded-xl border border-line bg-white/5 px-3 py-2 text-sm font-extrabold text-white/80 hover:bg-white/10"
                onClick={() => void refresh()}
                aria-label="Refresh data"
              >
                Refresh
              </button>
            </div>

            <div className="text-xs text-white/40">
              Missing ratings use <span className="font-extrabold text-white/60">defaultAspectValue={config.defaultAspectValue}</span>.
            </div>
          </div>
        </div>

        {isAdmin ? (
          <AdminPanel />
        ) : (
          <div className="rounded-2xl border border-line bg-bg-card px-4 py-3 text-xs text-white/50 shadow-soft">
            Admin features are hidden. Tap the trophy icon <span className="font-extrabold">{config.secretTapCount}</span> times within{' '}
            <span className="font-extrabold">{config.secretTapWindowSeconds}s</span> to open login.
          </div>
        )}
      </aside>

      <section className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-line bg-bg-card p-4 shadow-soft">Loading rankings…</div>
        ) : (
          <>
            <TierGrid entries={filtered} onSelect={openEntry} />
            <LeaderboardList entries={filtered} page={page} pageSize={pageSize} onPageChange={setPage} onSelect={openEntry} />
          </>
        )}
      </section>

      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      <EntryDrawer open={drawerOpen} entry={selected} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
