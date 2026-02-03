import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../lib/store';

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      onClose();
    } catch (err: any) {
      setError('Invalid username or password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="Admin Login" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-bold text-white/80" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-white placeholder:text-white/30"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-white/80" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-white placeholder:text-white/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

        <button
          className="w-full rounded-xl bg-accent px-4 py-2 font-extrabold text-black hover:bg-accent-2 disabled:opacity-60"
          disabled={busy}
          type="submit"
          aria-label="Log in"
        >
          {busy ? 'Logging in…' : 'Log in'}
        </button>

        <p className="text-xs text-white/50">
          This login is intentionally simple for local development.
        </p>
      </form>
    </Modal>
  );
}
