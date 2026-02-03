import { describe, it, expect } from 'vitest';
import { computeWeightedScore, ratingToValue } from './scoring';

const baseConfig = {
  siteTitle: 'x',
  aspects: ['Movement', 'Attack'],
  aspectWeights: { Movement: 1, Attack: 1 },
  defaultAspectValue: 3,
  adminCredentials: { username: 'a', password: 'b' },
  secretTapCount: 7,
  secretTapWindowSeconds: 3,
  assetsFolder: 'assets',
  placeholderImage: 'assets/questionmark.png',
  discordServerLink: '',
  allowConfigEdit: false,
  baseUrl: ''
};

describe('scoring mapping', () => {
  it('maps HT1 to 5 and LT5 to 1', () => {
    expect(ratingToValue('HT1')).toBe(5);
    expect(ratingToValue('HT2')).toBe(4);
    expect(ratingToValue('HT3')).toBe(3);
    expect(ratingToValue('HT4')).toBe(2);
    expect(ratingToValue('LT5')).toBe(1);
  });

  it('computes weighted score and percent', () => {
    const result = computeWeightedScore({ Movement: 'HT1', Attack: 'LT5' }, baseConfig as any);
    // (5 + 1) / 2 = 3
    expect(result.score).toBe(3);
    expect(result.percent).toBe(60);
  });

  it('uses defaultAspectValue when an aspect is missing', () => {
    const cfg = { ...baseConfig, defaultAspectValue: 3 } as any;
    const result = computeWeightedScore({ Movement: 'HT1' }, cfg);
    // Movement=5, Attack=default(3) => (5+3)/2 = 4
    expect(result.score).toBe(4);
    expect(result.percent).toBe(80);
  });
});
