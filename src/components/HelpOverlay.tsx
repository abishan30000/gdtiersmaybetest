import React from 'react';
import { Modal } from './Modal';
import { useConfig } from '../lib/store';

export function HelpOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config } = useConfig();
  if (!config) return null;

  return (
    <Modal open={open} title="How rankings are calculated" onClose={onClose}>
      <div className="space-y-4 text-sm text-white/80">
        <div className="rounded-2xl border border-line bg-bg-card2 px-4 py-3">
          <div className="font-bold text-white">Tier → value mapping</div>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-white/70">
            <li><span className="font-extrabold text-white">HT1</span> = 5 (highest)</li>
            <li><span className="font-extrabold text-white">HT2</span> = 4</li>
            <li><span className="font-extrabold text-white">HT3</span> = 3</li>
            <li><span className="font-extrabold text-white">HT4</span> = 2</li>
            <li><span className="font-extrabold text-white">LT5</span> = 1 (lowest)</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-bg-card2 px-4 py-3">
          <div className="font-bold text-white">Weighted average</div>
          <p className="mt-2 text-white/70">
            Overall score is a weighted average of aspect numeric values. Any missing aspect rating uses
            <span className="font-extrabold text-white"> defaultAspectValue={config.defaultAspectValue}</span>.
          </p>
          <div className="mt-3 rounded-xl bg-black/20 p-3 text-xs text-white/70">
            <div className="font-bold text-white/90">Weights</div>
            <ul className="mt-2 space-y-1">
              {config.aspects.map((a) => (
                <li key={a}>
                  {a}: <span className="font-extrabold">{config.aspectWeights?.[a] ?? 1}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-white/50">
          Tip: Click a player to open the quick view panel. If you are logged in, you can edit ratings and save.
        </p>
      </div>
    </Modal>
  );
}
