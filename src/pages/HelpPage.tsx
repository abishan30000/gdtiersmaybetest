import React from 'react';
import { useConfig } from '../lib/store';

export function HelpPage() {
  const { config } = useConfig();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-bg-card px-5 py-4 shadow-soft">
        <h1 className="font-baloo text-2xl font-extrabold tracking-wide">Help</h1>
        <p className="mt-2 text-sm text-white/70">
          Goober Dash Rankings uses per-aspect ratings (HT1…LT5) and a weighted overall score.
          Click any entry on the Rankings page to open the quick panel and see the full calculation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-bg-card px-5 py-4 shadow-soft">
          <h2 className="text-sm font-extrabold text-white">Rating scale</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/75">
            <div><span className="font-extrabold text-white">HT1</span> = 5</div>
            <div><span className="font-extrabold text-white">HT2</span> = 4</div>
            <div><span className="font-extrabold text-white">HT3</span> = 3</div>
            <div><span className="font-extrabold text-white">HT4</span> = 2</div>
            <div><span className="font-extrabold text-white">LT5</span> = 1</div>
          </div>
          <p className="mt-3 text-xs text-white/50">
            If a rating is missing, the system uses <span className="font-extrabold">defaultAspectValue</span> from config.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-bg-card px-5 py-4 shadow-soft">
          <h2 className="text-sm font-extrabold text-white">Current config</h2>
          {config ? (
            <div className="mt-3 space-y-2 text-sm text-white/75">
              <div>
                defaultAspectValue: <span className="font-extrabold text-white">{config.defaultAspectValue}</span>
              </div>
              <div className="rounded-xl bg-black/20 p-3">
                <div className="text-xs font-extrabold text-white/80">Weights</div>
                <ul className="mt-2 space-y-1 text-xs text-white/70">
                  {config.aspects.map((a) => (
                    <li key={a}>
                      {a}: <span className="font-extrabold text-white/80">{config.aspectWeights?.[a] ?? 1}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-white/60">Loading…</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-bg-card px-5 py-4 shadow-soft">
        <h2 className="text-sm font-extrabold text-white">Secret admin login</h2>
        <p className="mt-2 text-sm text-white/70">
          Tap the trophy icon in the header <span className="font-extrabold text-white">{config?.secretTapCount ?? 7}</span> times within{' '}
          <span className="font-extrabold text-white">{config?.secretTapWindowSeconds ?? 3}</span> seconds to open the login modal.
        </p>
        <p className="mt-2 text-xs text-white/50">
          When logged in, toggle <span className="font-extrabold">Admin editing</span> to enable adding, editing, deleting entries, and (optionally) editing weights.
        </p>
      </div>
    </div>
  );
}
