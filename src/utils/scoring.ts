import type { Config, Rating } from '../types/models';

export const RATING_TO_VALUE: Record<Rating, number> = {
  HT1: 5,
  HT2: 4,
  HT3: 3,
  HT4: 2,
  LT5: 1
};

export const ALLOWED_RATINGS: Rating[] = ['HT1', 'HT2', 'HT3', 'HT4', 'LT5'];

export function ratingToValue(rating: string | undefined | null): number | null {
  if (!rating) return null;
  const key = rating.toUpperCase().trim() as Rating;
  return (RATING_TO_VALUE as any)[key] ?? null;
}

export function clampDefaultAspectValue(v: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 3;
  return Math.max(1, Math.min(5, n));
}

export function computeWeightedScore(aspects: Record<string, string | undefined>, config: Config): { score: number; percent: number } {
  const defaultValue = clampDefaultAspectValue(config.defaultAspectValue ?? 3);
  const weights = config.aspectWeights ?? {};

  let sumW = 0;
  let sum = 0;

  for (const aspect of config.aspects) {
    const w = Number(weights[aspect] ?? 1);
    if (!Number.isFinite(w) || w <= 0) continue;
    const v = ratingToValue(aspects[aspect]) ?? defaultValue;
    sum += v * w;
    sumW += w;
  }

  const raw = sumW > 0 ? sum / sumW : defaultValue;
  const score = Math.round(raw * 100) / 100;
  const percent = Math.round((score / 5) * 100);
  return { score, percent };
}

export function buildExplanation(aspects: Record<string, string | undefined>, config: Config): string {
  const defaultValue = clampDefaultAspectValue(config.defaultAspectValue ?? 3);
  const parts = config.aspects.map((a) => {
    const w = Number(config.aspectWeights?.[a] ?? 1);
    const r = aspects[a];
    const v = ratingToValue(r) ?? defaultValue;
    const src = ratingToValue(r) === null ? `default ${defaultValue}` : `${r}`;
    return `${a}: ${src} → ${v} (w=${w})`;
  });

  return `Overall score = weighted average of aspect values. Mapping: HT1=5, HT2=4, HT3=3, HT4=2, LT5=1. Missing ratings use defaultAspectValue=${defaultValue}.\n\n${parts.join('\n')}`;
}

export function bucketTier(score: number): Rating {
  if (score >= 4.5) return 'HT1';
  if (score >= 4.0) return 'HT2';
  if (score >= 3.0) return 'HT3';
  if (score >= 2.0) return 'HT4';
  return 'LT5';
}
