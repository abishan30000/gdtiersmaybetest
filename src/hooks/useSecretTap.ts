import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useSecretTap(options: {
  countNeeded: number;
  windowSeconds: number;
  onComplete: () => void;
}) {
  const { countNeeded, windowSeconds, onComplete } = options;

  const [count, setCount] = useState(0);
  const [deadline, setDeadline] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    setCount(0);
    setDeadline(null);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tap = useCallback(() => {
    const now = Date.now();
    if (deadline && now > deadline) {
      // Too late, reset sequence
      reset();
    }

    setCount((prev) => {
      const next = prev + 1;
      if (next === 1) {
        const d = now + windowSeconds * 1000;
        setDeadline(d);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          reset();
        }, windowSeconds * 1000);
      }
      if (next >= countNeeded) {
        onComplete();
        reset();
        return 0;
      }
      return next;
    });
  }, [countNeeded, windowSeconds, deadline, onComplete, reset]);

  const timeLeftMs = useMemo(() => {
    if (!deadline) return 0;
    return Math.max(0, deadline - Date.now());
  }, [deadline, count]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { tap, reset, count, timeLeftMs, active: count > 0 };
}
