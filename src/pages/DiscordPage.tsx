import React from 'react';
import { useConfig } from '../lib/store';

export function DiscordPage() {
  const { config } = useConfig();
  const link = (config?.discordServerLink || '').trim();

  return (
    <div className="rounded-2xl border border-line bg-bg-card px-5 py-4 shadow-soft">
      <h1 className="font-baloo text-2xl font-extrabold tracking-wide">Discord</h1>
      <p className="mt-2 text-sm text-white/70">
        {link ? 'Join the Goober Dash community Discord:' : 'No discord link configured.'}
      </p>

      {link ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-line bg-black/20 p-3 text-sm text-white/80">
            <div className="text-xs font-extrabold text-white/60">discordServerLink</div>
            <div className="mt-1 break-all font-mono text-xs text-white/80">{link}</div>
          </div>
          <button
            className="inline-flex w-full items-center justify-center rounded-2xl bg-accent px-4 py-2 font-extrabold text-black hover:bg-accent-2 sm:w-auto"
            onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
            aria-label="Open Discord link in new tab"
          >
            Open Discord
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-black/20 p-4 text-sm text-white/70">
          Set <span className="font-mono font-bold">discordServerLink</span> in <span className="font-mono font-bold">config.json</span>.
        </div>
      )}
    </div>
  );
}
