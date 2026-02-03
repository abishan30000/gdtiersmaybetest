import React from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, HelpCircle, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

export function Header({
  title,
  onIconClick,
  isAdmin,
  onLogout,
  onToggleDebug,
  showDebug
}: {
  title: string;
  onIconClick: () => void;
  isAdmin: boolean;
  onLogout: () => void;
  onToggleDebug: () => void;
  showDebug: boolean;
}) {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold tracking-wide transition',
      isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-bg-card shadow-soft hover:border-white/30"
            onClick={onIconClick}
            aria-label="Main site icon"
          >
            <Trophy className="h-5 w-5 text-accent group-hover:text-accent-2" />
          </button>
          <div className="leading-tight">
            <div className="font-baloo text-lg font-extrabold tracking-wide">{title}</div>
            <div className="text-xs text-white/50">Overall rankings • Goober Dash</div>
          </div>
        </div>

        <nav className="flex items-center gap-1" aria-label="Top navigation">
          <NavLink to="/" end className={navClass}>
            <Trophy className="h-4 w-4" /> Rankings
          </NavLink>
          <NavLink to="/help" className={navClass}>
            <HelpCircle className="h-4 w-4" /> Help
          </NavLink>
          <NavLink to="/discord" className={navClass}>
            <MessageCircle className="h-4 w-4" /> Discord
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {import.meta.env.DEV && (
            <button
              className={clsx(
                'hidden rounded-xl border border-line px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10 md:inline-flex',
                showDebug && 'bg-white/10 text-white'
              )}
              onClick={onToggleDebug}
              aria-label="Toggle debug panel"
            >
              Debug
            </button>
          )}

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-extrabold text-accent">ADMIN</span>
              <button
                className="rounded-xl border border-line px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"
                onClick={onLogout}
                aria-label="Log out"
              >
                Log out
              </button>
            </div>
          ) : (
            <span className="hidden text-xs text-white/40 md:inline">Tap the icon 7× to log in</span>
          )}
        </div>
      </div>
    </header>
  );
}
