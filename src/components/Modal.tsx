import React, { useEffect } from 'react';

export function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-line bg-bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="font-baloo text-lg font-bold tracking-wide">{title}</h2>
            <button
              className="rounded-lg px-3 py-1 text-sm text-white/80 hover:bg-white/10"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
