import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { DebugPanel } from './components/DebugPanel';
import { LoginModal } from './components/LoginModal';
import { useSecretTap } from './hooks/useSecretTap';
import { useAuth, useConfig } from './lib/store';
import { RankingsPage } from './pages/RankingsPage';
import { HelpPage } from './pages/HelpPage';
import { DiscordPage } from './pages/DiscordPage';

export default function App() {
  const { config } = useConfig();
  const { isAdmin, logout } = useAuth();

  const [loginOpen, setLoginOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(() => localStorage.getItem('gd_dev_debug') === '1');

  useEffect(() => {
    localStorage.setItem('gd_dev_debug', showDebug ? '1' : '0');
  }, [showDebug]);

  const tapCountNeeded = config?.secretTapCount ?? 7;
  const tapWindowSeconds = config?.secretTapWindowSeconds ?? 3;

  const secret = useSecretTap({
    countNeeded: tapCountNeeded,
    windowSeconds: tapWindowSeconds,
    onComplete: () => setLoginOpen(true)
  });

  return (
    <div className="min-h-screen font-baloo">
      <Header
        title={config?.siteTitle ?? 'Goober Dash Rankings'}
        onIconClick={secret.tap}
        isAdmin={isAdmin}
        onLogout={logout}
        onToggleDebug={() => setShowDebug((v) => !v)}
        showDebug={showDebug}
      />

      <DebugPanel open={import.meta.env.DEV && showDebug} tapCount={secret.count} timeLeftMs={secret.timeLeftMs} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<RankingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/discord" element={<DiscordPage />} />
          <Route
            path="*"
            element={<div className="rounded-2xl border border-line bg-bg-card p-4 shadow-soft">Not found.</div>}
          />
        </Routes>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 text-xs text-white/40">
        <div className="mt-6 border-t border-line pt-4">Goober Dash Rankings • local dev build</div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
