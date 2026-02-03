import React from 'react';
import type { Entry, Rating } from '../types/models';
import { bucketTier } from '../utils/scoring';
import { TIER_LABELS, tierColor } from './tiers';

export function TierGrid({
  entries,
  onSelect
}: {
  entries: Entry[];
  onSelect: (entry: Entry) => void;
}) {
  const groups = React.useMemo(() => {
    const map: Record<Rating, Entry[]> = { HT1: [], HT2: [], HT3: [], HT4: [], LT5: [] };
    for (const e of entries) {
      const t = bucketTier(e.computed?.score ?? 0);
      map[t].push(e);
    }
    for (const t of TIER_LABELS) {
      map[t].sort((a, b) => (b.computed?.score ?? 0) - (a.computed?.score ?? 0));
    }
    return map;
  }, [entries]);

  return (
    <div className="rounded-2xl border border-line bg-bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="text-sm font-extrabold text-white">Tier grid</div>
        <div className="text-xs text-white/50">Bucketed by overall score</div>
      </div>

      <div className="divide-y divide-line">
        {TIER_LABELS.map((t) => (
          <div key={t} className="flex gap-3 px-4 py-3">
            <div className="w-20 shrink-0">
              <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${tierColor(t)}`}>{t}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                {groups[t].length === 0 ? (
                  <span className="text-xs text-white/40">No entries</span>
                ) : (
                  groups[t].map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onSelect(e)}
                      className="group flex items-center gap-2 rounded-xl border border-line bg-bg-card2 px-2 py-1.5 hover:border-white/25 hover:bg-white/5"
                      aria-label={`Open ${e.name}`}
                    >
                      <img
                        src={`/${e.image}`}
                        alt=""
                        className="h-7 w-7 rounded-lg border border-white/10 object-cover"
                        onError={(ev) => {
                          (ev.currentTarget as HTMLImageElement).src = '/assets/questionmark.png';
                        }}
                      />
                      <span className="max-w-[10rem] truncate text-xs font-extrabold text-white/80 group-hover:text-white">{e.name}</span>
                      <span className="text-[11px] text-white/45">{e.computed?.percent ?? 0}%</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
