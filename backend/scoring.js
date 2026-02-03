export const RATING_TO_VALUE = {
  HT1: 5,
  HT2: 4,
  HT3: 3,
  HT4: 2,
  LT5: 1,
};

export function ratingToValue(rating) {
  if (!rating) return null;
  const key = String(rating).trim().toUpperCase();
  return RATING_TO_VALUE[key] ?? null;
}

export function clampDefaultValue(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 3;
  return Math.max(1, Math.min(5, n));
}

function safeWeight(w) {
  const n = Number(w);
  if (!Number.isFinite(n)) return 0;
  return n;
}

/**
 * Returns { score, percent } where:
 * - score is weighted average (1..5) rounded to 2 decimals
 * - percent is score/5*100 rounded to whole number
 */
export function computeComputed(aspects, config) {
  const aspectOrder = Array.isArray(config?.aspects) ? config.aspects : Object.keys(config?.aspectWeights ?? {});
  const defaultValue = clampDefaultValue(config?.defaultAspectValue ?? 3);
  const weights = config?.aspectWeights ?? {};

  let weightedSum = 0;
  let weightSum = 0;

  for (const aspect of aspectOrder) {
    const w = safeWeight(weights?.[aspect] ?? 1);
    if (w <= 0) continue;

    const v = ratingToValue(aspects?.[aspect]) ?? defaultValue;
    weightedSum += v * w;
    weightSum += w;
  }

  const raw = weightSum > 0 ? weightedSum / weightSum : defaultValue;
  const score = Math.round(raw * 100) / 100;
  const percent = Math.round((score / 5) * 100);

  return { score, percent };
}
