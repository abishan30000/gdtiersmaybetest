import React from 'react';
import { TIER_LABELS, tierColor, tierName } from './tiers';

export function TierLegend() {
  return (
    <div className="rounded-2xl border border-line bg-bg-card px-4 py-3 shadow-soft">
      <div className="text-sm font-extrabold text-white">Legend</div>
      <div className="mt-3 space-y-2">
        {TIER_LABELS.map((t) => (
          <div key={t} className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold ${tierColor(t)}`}>{t}</span>
            <span className="text-xs text-white/60">{tierName(t)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
