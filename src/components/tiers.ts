import type { Rating } from '../types/models';

export const TIER_LABELS: Rating[] = ['HT1', 'HT2', 'HT3', 'HT4', 'LT5'];

export function tierColor(tier: Rating): string {
  switch (tier) {
    case 'HT1':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    case 'HT2':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
    case 'HT3':
      return 'bg-violet-500/15 text-violet-300 border-violet-500/40';
    case 'HT4':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    case 'LT5':
      return 'bg-red-500/15 text-red-300 border-red-500/40';
  }
}

export function tierName(tier: Rating): string {
  switch (tier) {
    case 'HT1':
      return 'High Tier 1';
    case 'HT2':
      return 'High Tier 2';
    case 'HT3':
      return 'High Tier 3';
    case 'HT4':
      return 'High Tier 4';
    case 'LT5':
      return 'Low Tier 5';
  }
}
