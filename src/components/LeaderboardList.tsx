import React from 'react';
import type { Entry } from '../types/models';
import { bucketTier } from '../utils/scoring';
import { tierColor } from './tiers';

export function LeaderboardList({
  entries,
  page,
  pageSize,
  onPageChange,
  onSelect
}: {
  entries: Entry[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelect: (entry: Entry) => void;
}) {
  const total = entries.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const slice = entries.slice(start, start + pageSize);

  return (
    <div className="rounded-2xl border border-line bg-bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="text-sm font-extrabold text-white">Overall leaderboard</div>
        <div className="text-xs text-white/50">
          Showing {start + 1}-{Math.min(start + pageSize, total)} of {total}
        </div>
      </div>

      <div className="divide-y divide-line">
        {slice.map((e, idx) => {
          const rank = start + idx + 1;
          const tier = bucketTier(e.computed?.score ?? 0);
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e)}
              className="group flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5"
              aria-label={`Open ${e.name}`}
            >
              <div className="w-10 shrink-0 text-center font-extrabold text-white/60">{rank}</div>
              <img
                src={`/${e.image}`}
                alt=""
                className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 object-cover"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).src = '/assets/questionmark.png';
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate font-extrabold text-white group-hover:text-accent">{e.name}</div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-extrabold ${tierColor(tier)}`}>{tier}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(e.aspects || {}).slice(0, 4).map(([k, v]) => (
                    <span key={k} className="rounded-lg bg-black/20 px-2 py-1 text-[11px] font-bold text-white/60">
                      {k}: <span className="font-extrabold text-white/70">{v || '-'}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs text-white/50">Overall</div>
                <div className="font-extrabold text-white">{e.computed?.percent ?? 0}%</div>
                <div className="text-[11px] text-white/40">{(e.computed?.score ?? 0).toFixed(2)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
        <div className="text-xs text-white/50">
          Page {safePage} / {pageCount}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-line px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 disabled:opacity-50"
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage <= 1}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            className="rounded-xl border border-line px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 disabled:opacity-50"
            onClick={() => onPageChange(Math.min(pageCount, safePage + 1))}
            disabled={safePage >= pageCount}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
