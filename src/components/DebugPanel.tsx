import React from 'react';

export function DebugPanel({
  open,
  tapCount,
  timeLeftMs
}: {
  open: boolean;
  tapCount: number;
  timeLeftMs: number;
}) {
  if (!open) return null;

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="mt-3 rounded-2xl border border-line bg-bg-card px-4 py-3 text-sm text-white/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="font-bold text-accent">Secret-tap debug</span>
          </div>
          <div>
            taps: <span className="font-extrabold">{tapCount}</span>
          </div>
          <div>
            time left: <span className="font-extrabold">{Math.ceil(timeLeftMs / 100) / 10}s</span>
          </div>
          <div className="text-xs text-white/50">
            Tip: click the trophy icon quickly.
          </div>
        </div>
      </div>
    </div>
  );
}
